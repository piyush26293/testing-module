import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelfHealDto {
  @ApiProperty({
    example: '#submit-button',
    description: 'The broken locator that failed',
  })
  @IsString()
  @IsNotEmpty()
  brokenLocator: string;

  @ApiProperty({
    example: 'Element not found',
    description: 'Error message from the failed test',
  })
  @IsString()
  @IsNotEmpty()
  errorMessage: string;

  @ApiProperty({
    example: '<html><body>...</body></html>',
    description: 'Current DOM snapshot of the page',
  })
  @IsString()
  @IsNotEmpty()
  domSnapshot: string;
}
