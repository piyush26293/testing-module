import { IsString, IsUUID, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'summary', description: 'Type of report to generate' })
  @IsString()
  @MaxLength(100)
  reportType: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Start date for the report period' })
  @IsDateString()
  timePeriodStart: string;

  @ApiProperty({ example: '2024-01-31T23:59:59Z', description: 'End date for the report period' })
  @IsDateString()
  timePeriodEnd: string;

  @ApiPropertyOptional({ example: 'January 2024 Test Report', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;
}
