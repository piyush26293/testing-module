import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { RunnerService } from './runner.service';
import { RunnerController } from './runner.controller';
import { BrowserManager } from './playwright/browser-manager';
import { TestExecutor } from './playwright/test-executor';
import { PlaywrightReporter } from './playwright/reporter';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'test-execution',
    }),
  ],
  controllers: [RunnerController],
  providers: [
    RunnerService,
    BrowserManager,
    TestExecutor,
    PlaywrightReporter,
  ],
  exports: [RunnerService],
})
export class RunnerModule {}
