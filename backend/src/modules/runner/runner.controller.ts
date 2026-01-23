import { Controller, Post, Get, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RunnerService } from './runner.service';
import { JwtAuthGuard } from '../../common/guards';
import { RunTestDto } from './dto/run-test.dto';

@ApiTags('runner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('runner')
export class RunnerController {
  constructor(private readonly runnerService: RunnerService) {}

  @Post('run')
  @ApiOperation({ summary: 'Run a test immediately' })
  async runTest(@Body() dto: RunTestDto) {
    return this.runnerService.runTest(dto);
  }

  @Post('queue')
  @ApiOperation({ summary: 'Queue a test for execution' })
  async queueTest(@Body() dto: RunTestDto) {
    const executionId = await this.runnerService.queueTest(dto);
    return { executionId, status: 'queued' };
  }

  @Get('executions')
  @ApiOperation({ summary: 'Get all test executions' })
  async getExecutions() {
    return this.runnerService.getExecutions();
  }

  @Get('executions/:id')
  @ApiOperation({ summary: 'Get execution status by ID' })
  async getExecutionStatus(@Param('id') id: string) {
    return this.runnerService.getExecutionStatus(id);
  }

  @Delete('executions/:id')
  @ApiOperation({ summary: 'Cancel a queued execution' })
  async cancelExecution(@Param('id') id: string) {
    await this.runnerService.cancelExecution(id);
    return { message: 'Execution cancelled' };
  }
}
