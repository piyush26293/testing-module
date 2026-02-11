export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PROJECTS: '/dashboard/projects',
  PROJECT_NEW: '/dashboard/projects/new',
  PROJECT_DETAIL: (id: string) => `/dashboard/projects/${id}`,
  TEST_CASES: '/dashboard/test-cases',
  TEST_CASE_NEW: '/dashboard/test-cases/new',
  TEST_CASE_DETAIL: (id: string) => `/dashboard/test-cases/${id}`,
  EXECUTIONS: '/dashboard/executions',
  EXECUTION_NEW: '/dashboard/executions/new',
  EXECUTION_DETAIL: (id: string) => `/dashboard/executions/${id}`,
  REPORTS: '/dashboard/reports',
  REPORT_DETAIL: (id: string) => `/dashboard/reports/${id}`,
  AI_GENERATOR: '/dashboard/ai-generator',
  SETTINGS: '/dashboard/settings',
  SETTINGS_PROFILE: '/dashboard/settings/profile',
  SETTINGS_TEAM: '/dashboard/settings/team',
  SETTINGS_API_KEYS: '/dashboard/settings/api-keys',
} as const;

export const TEST_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
] as const;

export const TEST_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'deprecated', label: 'Deprecated', color: 'bg-red-500' },
] as const;

export const EXECUTION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-500' },
  { value: 'running', label: 'Running', color: 'bg-blue-500' },
  { value: 'passed', label: 'Passed', color: 'bg-green-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
  { value: 'skipped', label: 'Skipped', color: 'bg-yellow-500' },
] as const;

export const BROWSERS = [
  { value: 'chromium', label: 'Chromium' },
  { value: 'firefox', label: 'Firefox' },
  { value: 'webkit', label: 'WebKit (Safari)' },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;