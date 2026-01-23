import { IsString, IsOptional, IsUrl, IsObject, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'E-Commerce Platform', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Main testing project for our e-commerce platform' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com', maxLength: 500 })
  @IsUrl()
  @IsOptional()
  baseUrl?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ type: 'object', example: { retryOnFailure: true, maxRetries: 3 } })
  @IsObject()
  @IsOptional()
  settings?: object;
}
