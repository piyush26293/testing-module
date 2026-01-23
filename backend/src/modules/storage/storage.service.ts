import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient, BucketItemFromList } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: MinioClient;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const useSSL = this.configService.get<boolean>('MINIO_USE_SSL', false);
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'testing-platform');

    this.minioClient = new MinioClient({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });

    this.logger.log(`MinIO client initialized for ${endpoint}:${port}`);
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  /**
   * Ensure the bucket exists, create if it doesn't
   */
  async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(
          this.bucketName,
          this.configService.get<string>('MINIO_REGION', 'us-east-1'),
        );
        this.logger.log(`Bucket "${this.bucketName}" created successfully`);
      } else {
        this.logger.log(`Bucket "${this.bucketName}" already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure bucket exists: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to initialize storage bucket');
    }
  }

  /**
   * Upload a file to MinIO
   * @param file - The file to upload
   * @param folder - Optional folder path (e.g., 'screenshots', 'videos', 'reports')
   * @returns The file URL
   */
  async uploadFile(file: Express.Multer.File, folder: string = ''): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const objectName = folder ? `${folder}/${fileName}` : fileName;

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        throw new BadRequestException('File size exceeds 100MB limit');
      }

      // Upload to MinIO
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'X-Original-Name': file.originalname,
        },
      );

      this.logger.log(`File uploaded successfully: ${objectName}`);

      // Return the file URL
      const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
      const port = this.configService.get<number>('MINIO_PORT', 9000);
      const useSSL = this.configService.get<boolean>('MINIO_USE_SSL', false);
      const protocol = useSSL ? 'https' : 'http';
      
      return `${protocol}://${endpoint}:${port}/${this.bucketName}/${objectName}`;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Download a file from MinIO
   * @param fileName - The file name or path to download
   * @returns The file stream
   */
  async downloadFile(fileName: string): Promise<Readable> {
    if (!fileName) {
      throw new BadRequestException('File name is required');
    }

    try {
      // Check if file exists
      await this.minioClient.statObject(this.bucketName, fileName);

      // Get file stream
      const stream = await this.minioClient.getObject(this.bucketName, fileName);
      this.logger.log(`File downloaded: ${fileName}`);
      
      return stream;
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found: ${fileName}`);
      }
      this.logger.error(`Failed to download file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to download file');
    }
  }

  /**
   * Delete a file from MinIO
   * @param fileName - The file name or path to delete
   */
  async deleteFile(fileName: string): Promise<void> {
    if (!fileName) {
      throw new BadRequestException('File name is required');
    }

    try {
      // Check if file exists
      await this.minioClient.statObject(this.bucketName, fileName);

      // Delete the file
      await this.minioClient.removeObject(this.bucketName, fileName);
      this.logger.log(`File deleted: ${fileName}`);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found: ${fileName}`);
      }
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Get a presigned URL for a file
   * @param fileName - The file name or path
   * @param expiry - Expiry time in seconds (default: 24 hours)
   * @returns The presigned URL
   */
  async getPresignedUrl(fileName: string, expiry: number = 86400): Promise<string> {
    if (!fileName) {
      throw new BadRequestException('File name is required');
    }

    // Validate expiry (max 7 days)
    const maxExpiry = 7 * 24 * 60 * 60; // 7 days in seconds
    if (expiry > maxExpiry) {
      throw new BadRequestException('Expiry time cannot exceed 7 days');
    }

    try {
      // Check if file exists
      await this.minioClient.statObject(this.bucketName, fileName);

      // Generate presigned URL
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        expiry,
      );
      
      this.logger.log(`Presigned URL generated for: ${fileName}`);
      return url;
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found: ${fileName}`);
      }
      this.logger.error(`Failed to generate presigned URL: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate presigned URL');
    }
  }

  /**
   * Get file metadata
   * @param fileName - The file name or path
   */
  async getFileMetadata(fileName: string): Promise<any> {
    try {
      const stat = await this.minioClient.statObject(this.bucketName, fileName);
      return {
        size: stat.size,
        etag: stat.etag,
        lastModified: stat.lastModified,
        contentType: stat.metaData['content-type'],
        originalName: stat.metaData['x-original-name'],
      };
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(`File not found: ${fileName}`);
      }
      throw new InternalServerErrorException('Failed to get file metadata');
    }
  }

  /**
   * List files in a folder
   * @param folder - The folder path
   * @param prefix - Optional prefix to filter files
   */
  async listFiles(folder: string = '', prefix: string = ''): Promise<string[]> {
    try {
      const objectsStream = this.minioClient.listObjects(
        this.bucketName,
        folder ? `${folder}/${prefix}` : prefix,
        false,
      );

      const files: string[] = [];
      
      return new Promise((resolve, reject) => {
        objectsStream.on('data', (obj: BucketItemFromList) => {
          if (obj.name) {
            files.push(obj.name);
          }
        });
        
        objectsStream.on('error', (error) => {
          this.logger.error(`Failed to list files: ${error.message}`, error.stack);
          reject(new InternalServerErrorException('Failed to list files'));
        });
        
        objectsStream.on('end', () => {
          resolve(files);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to list files');
    }
  }
}
