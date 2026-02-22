import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({ status: 201, description: 'Report generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or date range' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to project' })
  async generate(@Body() generateReportDto: GenerateReportDto, @CurrentUser('id') userId: string) {
    return this.reportsService.generate(generateReportDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List reports by project' })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns paginated reports list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to project' })
  async findAll(
    @Query('projectId', ParseUUIDPipe) projectId: string,
    @Query() pagination: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.findAll(projectId, pagination, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Returns the report' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.reportsService.findOne(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 204, description: 'Report deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to report' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    await this.reportsService.remove(id, userId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report file' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Returns the report file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to report' })
  @ApiResponse({ status: 404, description: 'Report or file not found' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile> {
    const report = await this.reportsService.findOne(id, userId);

    if (!report.filePath) {
      throw new NotFoundException('Report file not found');
    }

    const filePath = join(process.cwd(), report.filePath);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Report file not found on disk');
    }

    const file = createReadStream(filePath);
    return new StreamableFile(file, {
      type: 'application/pdf',
      disposition: `attachment; filename="${report.name}.pdf"`,
    });
  }
}
