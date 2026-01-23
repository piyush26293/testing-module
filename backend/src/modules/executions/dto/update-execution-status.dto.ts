import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExecutionStatus } from '../../../database/entities/test-execution.entity';

export class UpdateExecutionStatusDto {
  @ApiProperty({ description: 'Execution status', enum: ExecutionStatus })
  @IsEnum(ExecutionStatus)
  status: ExecutionStatus;

  @ApiPropertyOptional({ description: 'Error message if execution failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Stack trace if execution failed' })
  @IsOptional()
  @IsString()
  stackTrace?: string;

  @ApiPropertyOptional({ description: 'Duration in milliseconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMs?: number;
}
