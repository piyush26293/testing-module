import { Injectable } from '@nestjs/common';

export interface TestReport {
  testId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'passed' | 'failed' | 'skipped';
  steps: ReportStep[];
  errors: string[];
}

export interface ReportStep {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
}

@Injectable()
export class PlaywrightReporter {
  private reports: Map<string, TestReport> = new Map();

  startTest(testId: string): void {
    const report: TestReport = {
      testId,
      startTime: new Date(),
      status: 'running',
      steps: [],
      errors: [],
    };
    this.reports.set(testId, report);
  }

  addStep(testId: string, step: ReportStep): void {
    const report = this.reports.get(testId);
    if (report) {
      report.steps.push(step);
    }
  }

  addError(testId: string, error: string): void {
    const report = this.reports.get(testId);
    if (report) {
      report.errors.push(error);
    }
  }

  endTest(testId: string, status: 'passed' | 'failed' | 'skipped'): TestReport {
    const report = this.reports.get(testId);
    if (report) {
      report.endTime = new Date();
      report.status = status;
    }
    return report;
  }

  getReport(testId: string): TestReport | undefined {
    return this.reports.get(testId);
  }

  getAllReports(): TestReport[] {
    return Array.from(this.reports.values());
  }

  clearReport(testId: string): void {
    this.reports.delete(testId);
  }

  generateHtmlReport(report: TestReport): string {
    const duration = report.endTime ? report.endTime.getTime() - report.startTime.getTime() : 0;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Test Report - ${report.testId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f0f0f0; padding: 20px; }
    .passed { color: green; }
    .failed { color: red; }
    .step { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Test Report</h1>
    <p>Test ID: ${report.testId}</p>
    <p>Status: <span class="${report.status}">${report.status}</span></p>
    <p>Duration: ${duration}ms</p>
  </div>
  <div class="steps">
    <h2>Steps</h2>
    ${report.steps
      .map(
        (step) => `
      <div class="step">
        <strong>${step.name}</strong> - <span class="${step.status}">${step.status}</span>
        (${step.duration}ms)
        ${step.error ? `<p class="failed">Error: ${step.error}</p>` : ''}
      </div>
    `,
      )
      .join('')}
  </div>
  ${
    report.errors.length > 0
      ? `
    <div class="errors">
      <h2>Errors</h2>
      ${report.errors.map((error) => `<p class="failed">${error}</p>`).join('')}
    </div>
  `
      : ''
  }
</body>
</html>
    `;
  }
}
