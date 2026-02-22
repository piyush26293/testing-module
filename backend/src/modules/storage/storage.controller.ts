import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { UploadFileDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a file',
    description:
      'Upload a file to MinIO storage. Supports screenshots, videos, and report files. Maximum file size: 100MB',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (screenshots, videos, reports)',
        },
        folder: {
          type: 'string',
          description: 'Optional folder path (e.g., screenshots, videos, reports)',
          example: 'screenshots',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the uploaded file',
          example: 'http://localhost:9000/testing-platform/screenshots/abc-123.png',
        },
        fileName: {
          type: 'string',
          description: 'Name of the uploaded file',
          example: 'screenshots/abc-123.png',
        },
        message: {
          type: 'string',
          example: 'File uploaded successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - No file provided or file size exceeds limit',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const url = await this.storageService.uploadFile(file, uploadFileDto.folder);
    const fileName = url.split('/').slice(-2).join('/');

    return {
      url,
      fileName,
      message: 'File uploaded successfully',
    };
  }

  @Get('download/:fileName(*)')
  @ApiOperation({
    summary: 'Download a file',
    description: 'Download a file from MinIO storage. Returns the file as a stream.',
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - File name is required',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const fileStream = await this.storageService.downloadFile(fileName);
    const metadata = await this.storageService.getFileMetadata(fileName);

    // Set response headers
    res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${metadata.originalName || fileName}"`,
    );

    // Pipe the file stream to response
    fileStream.pipe(res);
  }

  @Delete(':fileName(*)')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a file',
    description: 'Delete a file from MinIO storage.',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'File deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - File name is required',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async deleteFile(@Param('fileName') fileName: string) {
    await this.storageService.deleteFile(fileName);
    return {
      message: 'File deleted successfully',
    };
  }

  @Get('presigned-url/:fileName(*)')
  @ApiOperation({
    summary: 'Get presigned URL for a file',
    description:
      'Generate a presigned URL for a file that allows temporary access without authentication. Maximum expiry: 7 days (604800 seconds).',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Presigned URL for the file',
          example:
            'http://localhost:9000/testing-platform/screenshots/abc-123.png?X-Amz-Algorithm=...',
        },
        expiresIn: {
          type: 'number',
          description: 'Expiry time in seconds',
          example: 86400,
        },
        message: {
          type: 'string',
          example: 'Presigned URL generated successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - File name is required or expiry exceeds maximum',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getPresignedUrl(
    @Param('fileName') fileName: string,
    @Query('expiry', new ParseIntPipe({ optional: true })) expiry: number = 86400,
  ) {
    const url = await this.storageService.getPresignedUrl(fileName, expiry);
    return {
      url,
      expiresIn: expiry,
      message: 'Presigned URL generated successfully',
    };
  }

  @Get('list')
  @ApiOperation({
    summary: 'List files in a folder',
    description: 'List all files in a specific folder or the entire bucket.',
  })
  @ApiResponse({
    status: 200,
    description: 'Files listed successfully',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: ['screenshots/abc-123.png', 'screenshots/def-456.jpg', 'videos/video-789.mp4'],
        },
        count: {
          type: 'number',
          example: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async listFiles(@Query('folder') folder: string = '', @Query('prefix') prefix: string = '') {
    const files = await this.storageService.listFiles(folder, prefix);
    return {
      files,
      count: files.length,
    };
  }

  @Get('metadata/:fileName(*)')
  @ApiOperation({
    summary: 'Get file metadata',
    description: 'Get metadata information for a specific file.',
  })
  @ApiResponse({
    status: 200,
    description: 'File metadata retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        size: {
          type: 'number',
          description: 'File size in bytes',
          example: 1024,
        },
        etag: {
          type: 'string',
          description: 'ETag of the file',
          example: '"abc123def456"',
        },
        lastModified: {
          type: 'string',
          format: 'date-time',
          description: 'Last modified timestamp',
        },
        contentType: {
          type: 'string',
          description: 'MIME type of the file',
          example: 'image/png',
        },
        originalName: {
          type: 'string',
          description: 'Original file name',
          example: 'screenshot.png',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getFileMetadata(@Param('fileName') fileName: string) {
    return this.storageService.getFileMetadata(fileName);
  }
}
