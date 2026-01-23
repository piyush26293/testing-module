import { IsOptional, IsUUID, IsEnum, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../database/entities/user.entity';

export class UserFiltersDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by organization ID' })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Filter by user role' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Search by email, first name, or last name' })
  @IsString()
  @IsOptional()
  search?: string;
}
