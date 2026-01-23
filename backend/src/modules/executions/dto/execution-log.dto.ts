import { IsUUID, IsOptional, IsInt, IsEnum, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExecutionStatus } from '../../../database/entities/test-execution.entity';

export class ExecutionLogDto {
  @ApiPropertyOptional({ description: 'Test Step ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  stepId?: string;

  @ApiProperty({ description: 'Order index of the step' })
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiProperty({ description: 'Execution status', enum: ExecutionStatus })
  @IsEnum(ExecutionStatus)
  status: ExecutionStatus;

  @ApiPropertyOptional({ description: 'Log message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Error message if step failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Screenshot URL' })
  @IsOptional()
  @IsString()
  screenshotUrl?: string;

  @ApiPropertyOptional({ description: 'Duration in milliseconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMs?: number;
}
