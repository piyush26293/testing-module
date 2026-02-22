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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ExecutionsService } from './executions.service';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { UpdateExecutionStatusDto } from './dto/update-execution-status.dto';
import { ExecutionFiltersDto } from './dto/execution-filters.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('executions')
@ApiBearerAuth()
@Controller('executions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new test execution' })
  @ApiResponse({ status: 201, description: 'Execution created and queued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to project' })
  async create(@Body() createDto: CreateExecutionDto, @CurrentUser('id') userId: string) {
    return this.executionsService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all executions with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated executions list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to project' })
  async findAll(@Query() filters: ExecutionFiltersDto, @CurrentUser('id') userId: string) {
    return this.executionsService.findAll(filters, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single execution by ID with logs' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns execution details with logs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this execution' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.executionsService.findOne(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update execution status (for internal use)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Execution status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateExecutionStatusDto,
  ) {
    return this.executionsService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an execution' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Execution deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete a running execution' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this execution' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    await this.executionsService.remove(id, userId);
    return { message: 'Execution deleted successfully' };
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop a running execution' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Execution stopped successfully' })
  @ApiResponse({ status: 400, description: 'Only running or pending executions can be stopped' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this execution' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async stopExecution(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.executionsService.stopExecution(id, userId);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get execution logs' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns execution logs ordered by step index' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this execution' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async getLogs(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.executionsService.getLogs(id, userId);
  }
}
