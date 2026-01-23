import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../common/guards';
import { UploadFileDto } from './dto/upload-file.dto';

@ApiTags('storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          enum: ['screenshots', 'videos', 'reports'],
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: 'screenshots' | 'videos' | 'reports' = 'reports',
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // File size validation (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    // File type validation
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'application/json',
      'text/html',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const fileName = await this.storageService.uploadFile(file, folder);
    const url = await this.storageService.getPresignedUrl(fileName);

    return {
      fileName,
      url,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get('download/:folder/:filename')
  @ApiOperation({ summary: 'Download a file' })
  async downloadFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ) {
    const fullPath = `${folder}/${filename}`;
    const stream = await this.storageService.getFile(fullPath);
    return new StreamableFile(stream);
  }

  @Get('url/:folder/:filename')
  @ApiOperation({ summary: 'Get presigned URL for a file' })
  @ApiQuery({ name: 'expiry', required: false, type: Number })
  async getFileUrl(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Query('expiry') expiry?: number,
  ) {
    const fullPath = `${folder}/${filename}`;
    const url = await this.storageService.getPresignedUrl(
      fullPath,
      expiry || 3600,
    );
    return { url };
  }

  @Delete(':folder/:filename')
  @ApiOperation({ summary: 'Delete a file' })
  async deleteFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ) {
    const fullPath = `${folder}/${filename}`;
    await this.storageService.deleteFile(fullPath);
    return { message: 'File deleted successfully' };
  }

  @Get('list')
  @ApiOperation({ summary: 'List all files' })
  @ApiQuery({ name: 'folder', required: false, type: String })
  async listFiles(@Query('folder') folder?: string) {
    const files = await this.storageService.listFiles(folder);
    return { files };
  }
}
