import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;

  @ApiProperty({
    enum: ['screenshots', 'videos', 'reports'],
    default: 'reports',
    description: 'Folder to store the file',
  })
  @IsEnum(['screenshots', 'videos', 'reports'])
  @IsNotEmpty()
  folder: 'screenshots' | 'videos' | 'reports';
}
