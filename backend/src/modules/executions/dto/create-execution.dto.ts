import { IsUUID, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExecutionTrigger, BrowserType } from '../../../database/entities/test-execution.entity';

export class CreateExecutionDto {
  @ApiProperty({ description: 'Project ID', format: 'uuid' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ description: 'Test Case ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  testCaseId?: string;

  @ApiPropertyOptional({ description: 'Test Suite ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  suiteId?: string;

  @ApiPropertyOptional({ description: 'Execution name', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  executionName?: string;

  @ApiProperty({ description: 'Browser type', enum: BrowserType, default: BrowserType.CHROMIUM })
  @IsEnum(BrowserType)
  browser: BrowserType;

  @ApiPropertyOptional({ description: 'Environment name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  environment?: string;

  @ApiProperty({
    description: 'Execution trigger',
    enum: ExecutionTrigger,
    default: ExecutionTrigger.MANUAL,
  })
  @IsEnum(ExecutionTrigger)
  trigger: ExecutionTrigger;
}
