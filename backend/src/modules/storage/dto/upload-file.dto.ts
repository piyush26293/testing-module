import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'Folder path where the file should be stored',
    example: 'screenshots',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Folder path must not exceed 255 characters' })
  folder?: string;
}
