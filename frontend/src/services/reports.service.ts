import { apiClient } from '@/lib/api-client';
import { Report, ReportStats } from '@/types/report.types';

export const reportsService = {
  async getAll(projectId?: string): Promise<Report[]> {
    const url = projectId ? `/reports?projectId=${projectId}` : '/reports';
    return apiClient.get<Report[]>(url);
  },

  async getById(id: string): Promise<Report> {
    return apiClient.get<Report>(`/reports/${id}`);
  },

  async create(data: {
    projectId: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
  }): Promise<Report> {
    return apiClient.post<Report>('/reports', data);
  },

  async exportPdf(id: string): Promise<Blob> {
    return apiClient.get(`/reports/${id}/export/pdf`, { responseType: 'blob' });
  },

  async exportExcel(id: string): Promise<Blob> {
    return apiClient.get(`/reports/${id}/export/excel`, { responseType: 'blob' });
  },

  async getTrends(projectId: string, days: number): Promise<ReportStats> {
    return apiClient.get<ReportStats>(`/reports/trends?projectId=${projectId}&days=${days}`);
  },
};
