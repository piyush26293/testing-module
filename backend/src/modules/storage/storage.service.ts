import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('storage.bucket');
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('storage.endpoint'),
      port: this.configService.get<number>('storage.port'),
      useSSL: this.configService.get<boolean>('storage.useSSL'),
      accessKey: this.configService.get<string>('storage.accessKey'),
      secretKey: this.configService.get<string>('storage.secretKey'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      console.error('Error initializing MinIO bucket:', error);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: 'screenshots' | 'videos' | 'reports',
  ): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    try {
      await this.minioClient.putObject(this.bucketName, fileName, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });
      return fileName;
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    folder: 'screenshots' | 'videos' | 'reports',
  ): Promise<string> {
    const fullPath = `${folder}/${Date.now()}-${fileName}`;

    try {
      await this.minioClient.putObject(this.bucketName, fullPath, buffer, buffer.length, {
        'Content-Type': contentType,
      });
      return fullPath;
    } catch (error) {
      throw new BadRequestException('Failed to upload buffer');
    }
  }

  async getFile(fileName: string): Promise<any> {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, fileName);
      return stream;
    } catch (error) {
      throw new BadRequestException('Failed to retrieve file');
    }
  }

  async getPresignedUrl(fileName: string, expirySeconds = 3600): Promise<string> {
    try {
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        expirySeconds,
      );
      return url;
    } catch (error) {
      throw new BadRequestException('Failed to generate presigned URL');
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
      throw new BadRequestException('Failed to delete file');
    }
  }

  async listFiles(folder?: string): Promise<string[]> {
    const files: string[] = [];
    const stream = this.minioClient.listObjects(this.bucketName, folder || '', true);

    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj.name));
      stream.on('error', reject);
      stream.on('end', () => resolve(files));
    });
  }
}
