import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateTestDto {
  @ApiProperty({
    example: 'User logs in, navigates to dashboard, and creates a new project',
    description: 'Description of the user flow to generate tests for',
  })
  @IsString()
  @IsNotEmpty()
  userFlow: string;

  @ApiProperty({
    example: 'https://example.com',
    required: false,
    description: 'URL of the application under test',
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    example: 'playwright',
    required: false,
    description: 'Test framework to generate code for',
  })
  @IsString()
  @IsOptional()
  framework?: string;
}
