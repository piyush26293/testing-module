import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { CreateAuditLogDto } from './dto/audit-log.dto';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @ApiOperation({ summary: 'Create an audit log entry' })
  @Roles('admin')
  async create(@Body() dto: CreateAuditLogDto) {
    return this.auditService.log(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all audit logs with filters' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'resource', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @Roles('admin')
  async findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const options: any = {};

    if (userId) options.userId = userId;
    if (action) options.action = action;
    if (resource) options.resource = resource;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (limit) options.limit = parseInt(limit, 10);
    if (offset) options.offset = parseInt(offset, 10);

    const [logs, total] = await Promise.all([
      this.auditService.findAll(options),
      this.auditService.count(options),
    ]);

    return {
      logs,
      total,
      limit: options.limit || null,
      offset: options.offset || 0,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @Roles('admin')
  async findByUser(@Param('userId') userId: string) {
    return this.auditService.findAll({ userId });
  }
}
