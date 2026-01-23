import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TestSuitesService } from './test-suites.service';
import { CreateTestSuiteDto } from './dto/create-test-suite.dto';
import { UpdateTestSuiteDto } from './dto/update-test-suite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('test-suites')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('test-suites')
export class TestSuitesController {
  constructor(private readonly testSuitesService: TestSuitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new test suite' })
  @ApiResponse({
    status: 201,
    description: 'Test suite created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to the project',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Project or parent test suite not found',
  })
  create(@Body() createTestSuiteDto: CreateTestSuiteDto, @CurrentUser('id') userId: string) {
    return this.testSuitesService.create(createTestSuiteDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test suites for a project' })
  @ApiQuery({
    name: 'projectId',
    required: true,
    description: 'Project ID to filter test suites',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of test suites with pagination',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to the project',
  })
  findAll(
    @Query('projectId') projectId: string,
    @Query() pagination: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.testSuitesService.findAll(projectId, pagination, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single test suite by ID' })
  @ApiParam({
    name: 'id',
    description: 'Test suite ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Test suite details',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to the project',
  })
  @ApiResponse({
    status: 404,
    description: 'Test suite not found',
  })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.testSuitesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test suite' })
  @ApiParam({
    name: 'id',
    description: 'Test suite ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Test suite updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to the project',
  })
  @ApiResponse({
    status: 404,
    description: 'Test suite not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateTestSuiteDto: UpdateTestSuiteDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.testSuitesService.update(id, updateTestSuiteDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a test suite' })
  @ApiParam({
    name: 'id',
    description: 'Test suite ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Test suite deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access or is not a project admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Test suite not found',
  })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.testSuitesService.remove(id, userId);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get all child test suites of a test suite' })
  @ApiParam({
    name: 'id',
    description: 'Parent test suite ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of child test suites',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to the project',
  })
  @ApiResponse({
    status: 404,
    description: 'Test suite not found',
  })
  getChildren(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.testSuitesService.getChildren(id, userId);
  }

  @Get('hierarchy/:projectId')
  @ApiOperation({
    summary: 'Get full hierarchical tree structure of test suites',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Hierarchical tree structure of test suites',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to the project',
  })
  getHierarchy(@Param('projectId') projectId: string, @CurrentUser('id') userId: string) {
    return this.testSuitesService.getHierarchy(projectId, userId);
  }
}
