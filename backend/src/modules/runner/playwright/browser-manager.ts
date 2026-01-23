import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { chromium, firefox, webkit, Browser, BrowserContext } from 'playwright';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

@Injectable()
export class BrowserManager implements OnModuleDestroy {
  private browsers: Map<BrowserType, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();

  async getBrowser(browserType: BrowserType = 'chromium'): Promise<Browser> {
    if (this.browsers.has(browserType)) {
      return this.browsers.get(browserType);
    }

    let browser: Browser;

    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch();
        break;
      case 'webkit':
        browser = await webkit.launch();
        break;
      default:
        browser = await chromium.launch();
    }

    this.browsers.set(browserType, browser);
    return browser;
  }

  async createContext(
    browserType: BrowserType = 'chromium',
    options: {
      headless?: boolean;
      viewport?: { width: number; height: number };
      recordVideo?: boolean;
      videosPath?: string;
    } = {},
  ): Promise<{ context: BrowserContext; contextId: string }> {
    const browser = await this.getBrowser(browserType);

    const contextOptions: any = {
      viewport: options.viewport || { width: 1280, height: 720 },
    };

    if (options.recordVideo) {
      contextOptions.recordVideo = {
        dir: options.videosPath || './videos',
      };
    }

    const context = await browser.newContext(contextOptions);
    const contextId = `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.contexts.set(contextId, context);

    return { context, contextId };
  }

  async closeContext(contextId: string): Promise<void> {
    const context = this.contexts.get(contextId);
    if (context) {
      await context.close();
      this.contexts.delete(contextId);
    }
  }

  async closeBrowser(browserType: BrowserType): Promise<void> {
    const browser = this.browsers.get(browserType);
    if (browser) {
      await browser.close();
      this.browsers.delete(browserType);
    }
  }

  async onModuleDestroy() {
    // Close all contexts
    for (const [contextId, context] of this.contexts.entries()) {
      await context.close();
    }
    this.contexts.clear();

    // Close all browsers
    for (const [browserType, browser] of this.browsers.entries()) {
      await browser.close();
    }
    this.browsers.clear();
  }
}
