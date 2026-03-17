import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { chromium, firefox, webkit, Browser, Page, BrowserContext } from 'playwright';
import {
  TestExecution,
  ExecutionStatus,
  BrowserType,
} from '../../database/entities/test-execution.entity';
import { ExecutionLog } from '../../database/entities/execution-log.entity';

@Processor('executions')
export class ExecutionsProcessor {
  private readonly logger = new Logger(ExecutionsProcessor.name);

  constructor(
    @InjectRepository(TestExecution)
    private readonly executionRepository: Repository<TestExecution>,
    @InjectRepository(ExecutionLog)
    private readonly executionLogRepository: Repository<ExecutionLog>,
  ) {}

  @Process('execute-test')
  async handleExecution(job: Job) {
    const { executionId } = job.data;
    this.logger.log(`Processing execution: ${executionId}`);

    try {
      const execution = await this.executionRepository.findOne({
        where: { id: executionId },
        relations: ['testCase', 'testCase.steps', 'suite', 'project'],
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

      // Execute the test with Playwright
      const result = await this.executeTestWithPlaywright(execution);

      execution.status = result.status;
      execution.completedAt = new Date();
      execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();
      execution.errorMessage = result.errorMessage;
      execution.stackTrace = result.stackTrace;
      await this.executionRepository.save(execution);

      this.logger.log(`Execution ${executionId} completed with status: ${result.status}`);
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

  private async executeTestWithPlaywright(
    execution: TestExecution,
  ): Promise<{ status: ExecutionStatus; errorMessage?: string; stackTrace?: string }> {
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      // Launch browser based on execution configuration
      browser = await this.launchBrowser(execution.browser);
      context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: './test-results/videos' },
      });
      page = await context.newPage();

      // If test case has steps, execute them
      if (execution.testCase?.steps && execution.testCase.steps.length > 0) {
        const sortedSteps = execution.testCase.steps.sort((a, b) => a.orderIndex - b.orderIndex);

        for (const step of sortedSteps) {
          const stepStartTime = Date.now();

          try {
            await this.executeTestStep(page, step, execution.id);

            const stepDuration = Date.now() - stepStartTime;
            await this.logStepExecution(
              execution.id,
              step.orderIndex,
              step.action,
              ExecutionStatus.PASSED,
              stepDuration,
            );
          } catch (stepError) {
            const stepDuration = Date.now() - stepStartTime;
            await this.logStepExecution(
              execution.id,
              step.orderIndex,
              step.action,
              ExecutionStatus.FAILED,
              stepDuration,
              stepError.message,
            );

            // Fail the entire execution if any step fails
            return {
              status: ExecutionStatus.FAILED,
              errorMessage: `Step ${step.orderIndex} failed: ${stepError.message}`,
              stackTrace: stepError.stack,
            };
          }
        }
      } else {
        // No steps defined, perform a simple smoke test
        await this.logStepExecution(
          execution.id,
          1,
          'Smoke test - verify browser launch',
          ExecutionStatus.PASSED,
          100,
        );
      }

      return { status: ExecutionStatus.PASSED };
    } catch (error) {
      this.logger.error(`Test execution failed: ${error.message}`, error.stack);
      return {
        status: ExecutionStatus.ERROR,
        errorMessage: error.message,
        stackTrace: error.stack,
      };
    } finally {
      // Cleanup resources
      if (page)
        await page.close().catch((e) => this.logger.error(`Page close error: ${e.message}`));
      if (context)
        await context.close().catch((e) => this.logger.error(`Context close error: ${e.message}`));
      if (browser)
        await browser.close().catch((e) => this.logger.error(`Browser close error: ${e.message}`));
    }
  }

  private async launchBrowser(browserType: BrowserType): Promise<Browser> {
    switch (browserType) {
      case BrowserType.FIREFOX:
        return await firefox.launch({ headless: true });
      case BrowserType.WEBKIT:
        return await webkit.launch({ headless: true });
      case BrowserType.CHROMIUM:
      case BrowserType.CHROME:
      case BrowserType.EDGE:
      default:
        return await chromium.launch({
          headless: true,
          channel: browserType === BrowserType.CHROME ? 'chrome' : undefined,
        });
    }
  }

  private async executeTestStep(page: Page, step: any, executionId: string): Promise<void> {
    const { action, selector, value } = step;

    this.logger.log(`Executing step: ${action} on ${selector || 'page'}`);

    switch (action.toLowerCase()) {
      case 'navigate':
      case 'goto':
        await page.goto(value || selector, { waitUntil: 'networkidle' });
        break;

      case 'click':
        await page.click(selector, { timeout: 10000 });
        break;

      case 'fill':
      case 'type':
        await page.fill(selector, value, { timeout: 10000 });
        break;

      case 'wait':
        const waitTime = parseInt(value) || 1000;
        await page.waitForTimeout(waitTime);
        break;

      case 'waitforselector':
        await page.waitForSelector(selector, { timeout: 10000 });
        break;

      case 'screenshot':
        await page.screenshot({
          path: `./test-results/screenshots/${executionId}-step-${step.orderIndex}.png`,
        });
        break;

      case 'asserttext':
      case 'verifytext':
        const element = await page.locator(selector);
        const text = await element.textContent();
        if (!text?.includes(value)) {
          throw new Error(
            `Expected text "${value}" not found in element "${selector}". Found: "${text}"`,
          );
        }
        break;

      case 'assertvisible':
      case 'verifyvisible':
        await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        break;

      default:
        this.logger.warn(`Unknown action: ${action}, skipping step`);
    }
  }

  private async logStepExecution(
    executionId: string,
    orderIndex: number,
    action: string,
    status: ExecutionStatus,
    durationMs: number,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const log = this.executionLogRepository.create({
        executionId,
        orderIndex,
        message: action,
        status,
        durationMs,
        errorMessage,
      });
      await this.executionLogRepository.save(log);
    } catch (error) {
      this.logger.error(`Failed to log step execution: ${error.message}`);
    }
  }
}
