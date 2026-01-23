import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzePageDto {
  @ApiProperty({
    example: 'https://example.com/login',
    description: 'URL of the page to analyze',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: '<html><body>...</body></html>',
    description: 'DOM tree of the page',
  })
  @IsString()
  @IsNotEmpty()
  domTree: string;

  @ApiProperty({
    example: '{ "role": "button", "name": "Submit" }',
    required: false,
    description: 'Accessibility tree of the page',
  })
  @IsString()
  @IsOptional()
  accessibilityTree?: string;
}
