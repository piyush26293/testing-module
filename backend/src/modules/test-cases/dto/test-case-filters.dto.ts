import { IsOptional, IsUUID, IsEnum, IsArray, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TestCaseStatus, TestCasePriority } from '../../../database/entities/test-case.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class TestCaseFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  @IsOptional()
  suiteId?: string;

  @ApiPropertyOptional({ enum: TestCaseStatus })
  @IsEnum(TestCaseStatus)
  @IsOptional()
  status?: TestCaseStatus;

  @ApiPropertyOptional({ enum: TestCasePriority })
  @IsEnum(TestCasePriority)
  @IsOptional()
  priority?: TestCasePriority;

  @ApiPropertyOptional({ example: ['login', 'authentication'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  tags?: string[];

  @ApiPropertyOptional({ example: 'login' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isAiGenerated?: boolean;
}
