import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestExecution, ExecutionStatus } from '../../database/entities/test-execution.entity';

@Processor('executions')
export class ExecutionsProcessor {
  private readonly logger = new Logger(ExecutionsProcessor.name);

  constructor(
    @InjectRepository(TestExecution)
    private readonly executionRepository: Repository<TestExecution>,
  ) {}

  @Process('execute-test')
  async handleExecution(job: Job) {
    const { executionId } = job.data;
    this.logger.log(`Processing execution: ${executionId}`);

    try {
      const execution = await this.executionRepository.findOne({
        where: { id: executionId },
        relations: ['testCase', 'suite', 'project'],
      });

      if (!execution) {
        this.logger.error(`Execution ${executionId} not found`);
        return;
      }

      execution.status = ExecutionStatus.RUNNING;
      execution.startedAt = new Date();
      await this.executionRepository.save(execution);

      this.logger.log(`Execution ${executionId} started`);
      this.logger.log(`Project: ${execution.project?.name}`);
      this.logger.log(`Test Case: ${execution.testCase?.name}`);
      this.logger.log(`Test Suite: ${execution.suite?.name}`);
      this.logger.log(`Browser: ${execution.browser}`);
      this.logger.log(`Environment: ${execution.environment}`);

      // TODO: Implement actual test execution logic here
      // This is a placeholder that simulates execution
      await this.simulateExecution(execution);

      execution.status = ExecutionStatus.PASSED;
      execution.completedAt = new Date();
      execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();
      await this.executionRepository.save(execution);

      this.logger.log(`Execution ${executionId} completed successfully`);
    } catch (error) {
      this.logger.error(`Execution ${executionId} failed: ${error.message}`, error.stack);

      const execution = await this.executionRepository.findOne({
        where: { id: executionId },
      });

      if (execution) {
        execution.status = ExecutionStatus.ERROR;
        execution.completedAt = new Date();
        execution.errorMessage = error.message;
        execution.stackTrace = error.stack;
        
        if (execution.startedAt) {
          execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();
        }

        await this.executionRepository.save(execution);
      }
    }
  }

  private async simulateExecution(execution: TestExecution): Promise<void> {
    // Simulate test execution delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.logger.log(`Simulated execution for ${execution.id}`);
  }
}
