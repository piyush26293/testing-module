import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RunTestDto {
  @ApiProperty({
    example: 'test-123',
    description: 'ID of the test to run',
  })
  @IsString()
  @IsNotEmpty()
  testId: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'URL to test',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    enum: ['chromium', 'firefox', 'webkit'],
    default: 'chromium',
    description: 'Browser to use for testing',
  })
  @IsEnum(['chromium', 'firefox', 'webkit'])
  @IsOptional()
  browser?: 'chromium' | 'firefox' | 'webkit';

  @ApiProperty({
    example: false,
    default: false,
    description: 'Run in headless mode',
  })
  @IsBoolean()
  @IsOptional()
  headless?: boolean;

  @ApiProperty({
    example: true,
    default: true,
    description: 'Capture screenshots',
  })
  @IsBoolean()
  @IsOptional()
  screenshots?: boolean;

  @ApiProperty({
    example: false,
    default: false,
    description: 'Record video',
  })
  @IsBoolean()
  @IsOptional()
  video?: boolean;

  @ApiProperty({
    example: 30000,
    default: 30000,
    description: 'Timeout in milliseconds',
  })
  @IsNumber()
  @IsOptional()
  timeout?: number;

  @ApiProperty({
    example: '{}',
    required: false,
    description: 'Test data as JSON',
  })
  @IsString()
  @IsOptional()
  testData?: string;
}
