import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, UserRole } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new organization (Admin only)' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Organization with this name already exists' })
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated organizations list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query() pagination: PaginationDto,
    @CurrentUser('role') userRole: UserRole,
    @CurrentUser('organizationId') userOrgId: string,
  ) {
    const filterOrgId = userRole !== UserRole.ADMIN ? userOrgId : undefined;
    return this.organizationsService.findAll(pagination, filterOrgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single organization by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns organization details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('role') userRole: UserRole,
    @CurrentUser('organizationId') userOrgId: string,
  ) {
    const organization = await this.organizationsService.findOne(id);

    if (userRole !== UserRole.ADMIN && organization.id !== userOrgId) {
      throw new ForbiddenException('You can only access your own organization');
    }

    return organization;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an organization' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 409, description: 'Organization with this name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser('role') userRole: UserRole,
    @CurrentUser('organizationId') userOrgId: string,
  ) {
    const organization = await this.organizationsService.findOne(id);

    if (userRole !== UserRole.ADMIN && organization.id !== userOrgId) {
      throw new ForbiddenException('You can only update your own organization');
    }

    if (userRole !== UserRole.ADMIN && updateOrganizationDto.isActive !== undefined) {
      throw new ForbiddenException('Only admins can change active status');
    }

    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete an organization (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.organizationsService.remove(id);
    return { message: 'Organization deleted successfully' };
  }
}
