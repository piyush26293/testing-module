import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class CreateTestSuiteDto {
  @ApiProperty({
    description: 'Project ID that this test suite belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: 'Name of the test suite',
    example: 'User Authentication Tests',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the test suite',
    example: 'All test cases related to user authentication flows',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent test suite ID for hierarchical structure',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  parentSuiteId?: string;

  @ApiPropertyOptional({
    description: 'Order index for sorting test suites',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
