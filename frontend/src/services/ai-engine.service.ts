import { apiClient } from '@/lib/api-client';
import { TestCase } from '@/types/test-case.types';

export interface AIGenerateRequest {
  url: string;
  description: string;
  projectId: string;
}

export interface AIGenerateResponse {
  testCase: TestCase;
  confidence: number;
}

export interface SelfHealSuggestion {
  stepId: string;
  originalSelector: string;
  suggestedSelector: string;
  confidence: number;
  reason: string;
}

export const aiEngineService = {
  async generateTest(data: AIGenerateRequest): Promise<AIGenerateResponse> {
    return apiClient.post<AIGenerateResponse>('/ai/generate', data);
  },

  async getSelfHealSuggestions(executionId: string): Promise<SelfHealSuggestion[]> {
    return apiClient.get<SelfHealSuggestion[]>(`/ai/self-heal/${executionId}`);
  },

  async applySelfHeal(testCaseId: string, suggestions: SelfHealSuggestion[]): Promise<TestCase> {
    return apiClient.post<TestCase>(`/ai/self-heal/apply`, {
      testCaseId,
      suggestions,
    });
  },
};
