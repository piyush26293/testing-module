import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  ExecutionStatus,
  ExecutionTrigger,
  BrowserType,
} from '../../../database/entities/test-execution.entity';

export class ExecutionFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Project ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Filter by Test Case ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  testCaseId?: string;

  @ApiPropertyOptional({ description: 'Filter by Test Suite ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  suiteId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ExecutionStatus })
  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @ApiPropertyOptional({ description: 'Filter by trigger', enum: ExecutionTrigger })
  @IsOptional()
  @IsEnum(ExecutionTrigger)
  trigger?: ExecutionTrigger;

  @ApiPropertyOptional({ description: 'Filter by browser', enum: BrowserType })
  @IsOptional()
  @IsEnum(BrowserType)
  browser?: BrowserType;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
