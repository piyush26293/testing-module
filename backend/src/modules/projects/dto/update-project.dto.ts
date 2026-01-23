import { IsString, IsOptional, IsUrl, IsObject, IsEnum, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../../../database/entities/project.entity';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'E-Commerce Platform', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated project description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com', maxLength: 500 })
  @IsUrl()
  @IsOptional()
  baseUrl?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.ACTIVE })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({ type: 'object', example: { retryOnFailure: true, maxRetries: 3 } })
  @IsObject()
  @IsOptional()
  settings?: object;
}
