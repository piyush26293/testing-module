import { apiClient } from '@/lib/api-client';
import { TestCase, TestCaseFormData, TestSuite } from '@/types/test-case.types';

export const testCasesService = {
  async getAll(projectId?: string): Promise<TestCase[]> {
    const url = projectId ? `/test-cases?projectId=${projectId}` : '/test-cases';
    return apiClient.get<TestCase[]>(url);
  },

  async getById(id: string): Promise<TestCase> {
    return apiClient.get<TestCase>(`/test-cases/${id}`);
  },

  async create(data: TestCaseFormData & { projectId: string }): Promise<TestCase> {
    return apiClient.post<TestCase>('/test-cases', data);
  },

  async update(id: string, data: Partial<TestCaseFormData>): Promise<TestCase> {
    return apiClient.patch<TestCase>(`/test-cases/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/test-cases/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    return apiClient.post('/test-cases/bulk-delete', { ids });
  },

  async getSuites(projectId: string): Promise<TestSuite[]> {
    return apiClient.get<TestSuite[]>(`/projects/${projectId}/suites`);
  },

  async createSuite(projectId: string, data: { name: string; description: string }): Promise<TestSuite> {
    return apiClient.post<TestSuite>(`/projects/${projectId}/suites`, data);
  },
};
