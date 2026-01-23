import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TestCasesService } from './test-cases.service';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestStepDto } from './dto/test-step.dto';
import { TestCaseFiltersDto } from './dto/test-case-filters.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('test-cases')
@ApiBearerAuth()
@Controller('test-cases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test case' })
  @ApiResponse({ status: 201, description: 'Test case created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to project' })
  async create(@Body() createTestCaseDto: CreateTestCaseDto, @CurrentUser('id') userId: string) {
    return this.testCasesService.create(createTestCaseDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test cases with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated test cases list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to project' })
  async findAll(@Query() filters: TestCaseFiltersDto, @CurrentUser('id') userId: string) {
    return this.testCasesService.findAll(filters, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single test case with all steps' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns test case details with steps' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this test case' })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.testCasesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test case' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Test case updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this test case' })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTestCaseDto: UpdateTestCaseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.testCasesService.update(id, updateTestCaseDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a test case' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Test case deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this test case' })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    await this.testCasesService.remove(id, userId);
    return { message: 'Test case deleted successfully' };
  }

  @Put(':id/steps')
  @ApiOperation({ summary: 'Update all steps for a test case' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: [TestStepDto] })
  @ApiResponse({ status: 200, description: 'Test steps updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this test case' })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async updateSteps(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() steps: TestStepDto[],
    @CurrentUser('id') userId: string,
  ) {
    return this.testCasesService.updateSteps(id, steps, userId);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a test case with all steps' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Test case duplicated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to this test case' })
  @ApiResponse({ status: 404, description: 'Test case not found' })
  async duplicate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.testCasesService.duplicate(id, userId);
  }
}
