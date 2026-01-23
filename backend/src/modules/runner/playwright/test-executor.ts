import { Injectable, BadRequestException } from '@nestjs/common';
import { Page } from 'playwright';
import { BrowserManager } from './browser-manager';
import { PlaywrightReporter } from './reporter';
import { RunTestDto } from '../dto/run-test.dto';

export interface TestStep {
  action: string;
  selector?: string;
  value?: string;
  screenshot?: string;
}

export interface TestResult {
  success: boolean;
  duration: number;
  steps: TestStep[];
  screenshots: string[];
  video?: string;
  error?: string;
}

@Injectable()
export class TestExecutor {
  constructor(
    private browserManager: BrowserManager,
    private reporter: PlaywrightReporter,
  ) {}

  async execute(dto: RunTestDto): Promise<TestResult> {
    const startTime = Date.now();
    const steps: TestStep[] = [];
    const screenshots: string[] = [];

    let page: Page;
    let contextId: string;

    try {
      // Create browser context
      const { context, contextId: ctxId } = await this.browserManager.createContext(
        dto.browser || 'chromium',
        {
          headless: dto.headless !== false,
          recordVideo: dto.video || false,
        },
      );
      contextId = ctxId;

      page = await context.newPage();

      // Set timeout
      page.setDefaultTimeout(dto.timeout || 30000);

      // Navigate to URL
      await page.goto(dto.url);
      steps.push({ action: 'navigate', value: dto.url });

      if (dto.screenshots) {
        const screenshot = await this.captureScreenshot(page, 'initial');
        screenshots.push(screenshot);
      }

      // Here you would execute actual test steps
      // This is a simplified version - in production, you'd parse and execute test steps
      await page.waitForLoadState('networkidle');
      steps.push({ action: 'wait', value: 'networkidle' });

      if (dto.screenshots) {
        const screenshot = await this.captureScreenshot(page, 'loaded');
        screenshots.push(screenshot);
      }

      // Close page and context
      await page.close();
      await this.browserManager.closeContext(contextId);

      const duration = Date.now() - startTime;

      return {
        success: true,
        duration,
        steps,
        screenshots,
      };
    } catch (error) {
      // Cleanup on error
      if (page && !page.isClosed()) {
        await page.close().catch(() => {});
      }
      if (contextId) {
        await this.browserManager.closeContext(contextId).catch(() => {});
      }

      const duration = Date.now() - startTime;

      return {
        success: false,
        duration,
        steps,
        screenshots,
        error: error.message,
      };
    }
  }

  private async captureScreenshot(page: Page, name: string): Promise<string> {
    await page.screenshot({ fullPage: false });
    const filename = `screenshot-${name}-${Date.now()}.png`;

    // In production, you'd upload this to storage service
    // For now, return the filename
    return filename;
  }

  async executeCustomScript(page: Page, script: string, context?: any): Promise<any> {
    try {
      return await page.evaluate(script, context);
    } catch (error) {
      throw new BadRequestException('Failed to execute script: ' + error.message);
    }
  }
}
