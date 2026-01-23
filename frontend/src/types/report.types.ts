export interface Report {
  id: string;
  projectId: string;
  name: string;
  type: 'test-run' | 'trend-analysis' | 'custom';
  startDate: string;
  endDate: string;
  stats: ReportStats;
  createdAt: string;
}

export interface ReportStats {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  averageDuration: number;
  trends: TrendData[];
}

export interface TrendData {
  date: string;
  passed: number;
  failed: number;
  total: number;
  passRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}
