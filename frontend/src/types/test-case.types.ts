export interface TestCase {
  id: string;
  projectId: string;
  suiteId?: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'deprecated';
  tags: string[];
  steps: TestStep[];
  createdAt: string;
  updatedAt: string;
}

export interface TestStep {
  id: string;
  order: number;
  action: string;
  selector?: string;
  value?: string;
  expectedResult?: string;
}

export interface TestSuite {
  id: string;
  projectId: string;
  name: string;
  description: string;
  testCases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseFormData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'deprecated';
  tags: string[];
  steps: TestStep[];
}
