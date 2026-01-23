export interface Execution {
  id: string;
  projectId: string;
  testCaseId: string;
  testCaseName: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  browser: 'chromium' | 'firefox' | 'webkit';
  environment: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: string;
  results: ExecutionResult[];
}

export interface ExecutionResult {
  stepId: string;
  stepOrder: number;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  screenshot?: string;
  error?: string;
  logs?: string[];
}

export interface ExecutionStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
}

export interface ExecutionFormData {
  projectId: string;
  testCaseIds: string[];
  browser: 'chromium' | 'firefox' | 'webkit';
  environment: string;
}
