import { IsString, IsOptional, IsInt, IsEnum, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StepType, LocatorStrategy } from '../../../database/entities/test-step.entity';

export class TestStepDto {
  @ApiProperty({ example: 0, description: 'Order of the step in the test case' })
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiProperty({ enum: StepType, example: StepType.CLICK })
  @IsEnum(StepType)
  stepType: StepType;

  @ApiPropertyOptional({ example: 'Click on login button' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'click', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  action: string;

  @ApiPropertyOptional({ example: '#login-button', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  targetElement?: string;

  @ApiPropertyOptional({ enum: LocatorStrategy, example: LocatorStrategy.CSS })
  @IsEnum(LocatorStrategy)
  @IsOptional()
  targetLocator?: LocatorStrategy;

  @ApiPropertyOptional({ example: 'username@example.com' })
  @IsString()
  @IsOptional()
  inputData?: string;

  @ApiPropertyOptional({ example: 'User should be redirected to dashboard' })
  @IsString()
  @IsOptional()
  expectedResult?: string;

  @ApiPropertyOptional({ example: 5000, default: 5000 })
  @IsInt()
  @Min(100)
  @IsOptional()
  timeout?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  screenshotEnabled?: boolean;
}
