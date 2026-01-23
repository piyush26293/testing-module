import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({
    example: 'user-123',
    description: 'ID of the user performing the action',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'CREATE_TEST',
    description: 'Action performed',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    example: 'test',
    description: 'Resource affected',
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    example: '{"testId": "test-123", "name": "Login Test"}',
    required: false,
    description: 'Additional metadata as JSON string',
  })
  @IsString()
  @IsOptional()
  metadata?: string;

  @ApiProperty({
    example: '192.168.1.1',
    required: false,
    description: 'IP address of the user',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({
    example: 'Mozilla/5.0...',
    required: false,
    description: 'User agent string',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
