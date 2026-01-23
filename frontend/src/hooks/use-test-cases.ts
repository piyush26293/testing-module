import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testCasesService } from '@/services/test-cases.service';
import { TestCaseFormData } from '@/types/test-case.types';
import { useToast } from './use-toast';

export function useTestCases(projectId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: testCases, isLoading, error } = useQuery({
    queryKey: ['test-cases', projectId],
    queryFn: () => testCasesService.getAll(projectId),
  });

  const createMutation = useMutation({
    mutationFn: (data: TestCaseFormData & { projectId: string }) =>
      testCasesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      toast.success('Test case created successfully');
    },
    onError: () => {
      toast.error('Failed to create test case');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TestCaseFormData> }) =>
      testCasesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      toast.success('Test case updated successfully');
    },
    onError: () => {
      toast.error('Failed to update test case');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testCasesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      toast.success('Test case deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete test case');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => testCasesService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      toast.success('Test cases deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete test cases');
    },
  });

  return {
    testCases: testCases || [],
    isLoading,
    error,
    createTestCase: createMutation.mutate,
    updateTestCase: updateMutation.mutate,
    deleteTestCase: deleteMutation.mutate,
    bulkDeleteTestCases: bulkDeleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTestCase(id: string) {
  const { data: testCase, isLoading, error } = useQuery({
    queryKey: ['test-case', id],
    queryFn: () => testCasesService.getById(id),
    enabled: !!id,
  });

  return { testCase, isLoading, error };
}
