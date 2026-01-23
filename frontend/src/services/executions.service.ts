import { apiClient } from '@/lib/api-client';
import { Execution, ExecutionFormData, ExecutionStats } from '@/types/execution.types';

export const executionsService = {
  async getAll(projectId?: string): Promise<Execution[]> {
    const url = projectId ? `/executions?projectId=${projectId}` : '/executions';
    return apiClient.get<Execution[]>(url);
  },

  async getById(id: string): Promise<Execution> {
    return apiClient.get<Execution>(`/executions/${id}`);
  },

  async create(data: ExecutionFormData): Promise<Execution> {
    return apiClient.post<Execution>('/executions', data);
  },

  async getStats(projectId?: string): Promise<ExecutionStats> {
    const url = projectId ? `/executions/stats?projectId=${projectId}` : '/executions/stats';
    return apiClient.get<ExecutionStats>(url);
  },

  async cancel(id: string): Promise<void> {
    return apiClient.post(`/executions/${id}/cancel`);
  },

  async getScreenshot(executionId: string, stepId: string): Promise<string> {
    return apiClient.get<string>(`/executions/${executionId}/screenshots/${stepId}`);
  },

  async getVideo(executionId: string): Promise<string> {
    return apiClient.get<string>(`/executions/${executionId}/video`);
  },
};
