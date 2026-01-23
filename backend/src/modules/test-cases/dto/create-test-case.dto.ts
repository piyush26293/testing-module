import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestCaseStatus, TestCasePriority } from '../../../database/entities/test-case.entity';
import { TestStepDto } from './test-step.dto';

export class CreateTestCaseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  @IsOptional()
  suiteId?: string;

  @ApiProperty({ example: 'User Login Test', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Test user login functionality with valid credentials' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TestCaseStatus, default: TestCaseStatus.DRAFT })
  @IsEnum(TestCaseStatus)
  @IsOptional()
  status?: TestCaseStatus;

  @ApiPropertyOptional({ enum: TestCasePriority, default: TestCasePriority.MEDIUM })
  @IsEnum(TestCasePriority)
  @IsOptional()
  priority?: TestCasePriority;

  @ApiPropertyOptional({ example: ['login', 'authentication', 'critical'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'User must be logged out' })
  @IsString()
  @IsOptional()
  preconditions?: string;

  @ApiPropertyOptional({ example: 'User session should be created' })
  @IsString()
  @IsOptional()
  postconditions?: string;

  @ApiPropertyOptional({ example: 30000, default: 30000 })
  @IsInt()
  @Min(1000)
  @IsOptional()
  timeout?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  retryCount?: number;

  @ApiPropertyOptional({ type: [TestStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestStepDto)
  @IsOptional()
  steps?: TestStepDto[];
}
