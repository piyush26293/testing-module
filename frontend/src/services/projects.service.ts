import { apiClient } from '@/lib/api-client';
import { Project, ProjectFormData, ProjectSettings } from '@/types/project.types';

export const projectsService = {
  async getAll(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  },

  async getById(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  async create(data: ProjectFormData): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  },

  async update(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/projects/${id}`);
  },

  async getSettings(id: string): Promise<ProjectSettings> {
    return apiClient.get<ProjectSettings>(`/projects/${id}/settings`);
  },

  async updateSettings(id: string, data: Partial<ProjectSettings>): Promise<ProjectSettings> {
    return apiClient.patch<ProjectSettings>(`/projects/${id}/settings`, data);
  },
};
