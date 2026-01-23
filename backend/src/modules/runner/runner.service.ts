import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RunTestDto } from './dto/run-test.dto';
import { TestExecutor } from './playwright/test-executor';

export interface TestExecution {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

@Injectable()
export class RunnerService {
  private executions: Map<string, TestExecution> = new Map();

  constructor(
    @InjectQueue('test-execution') private testQueue: Queue,
    private testExecutor: TestExecutor,
  ) {}

  async queueTest(dto: RunTestDto): Promise<string> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const execution: TestExecution = {
      id: executionId,
      status: 'queued',
    };

    this.executions.set(executionId, execution);

    await this.testQueue.add('run-test', {
      executionId,
      dto,
    });

    return executionId;
  }

  async runTest(dto: RunTestDto): Promise<any> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const execution: TestExecution = {
      id: executionId,
      status: 'running',
      startTime: new Date(),
    };

    this.executions.set(executionId, execution);

    try {
      const result = await this.testExecutor.execute(dto);

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.result = result;

      return result;
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error.message;

      throw error;
    }
  }

  async getExecutionStatus(executionId: string): Promise<TestExecution> {
    return this.executions.get(executionId);
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'queued') {
      execution.status = 'failed';
      execution.error = 'Cancelled by user';
    }
  }

  async getExecutions(): Promise<TestExecution[]> {
    return Array.from(this.executions.values());
  }
}
