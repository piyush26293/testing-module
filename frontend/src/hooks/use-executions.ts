import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executionsService } from '@/services/executions.service';
import { ExecutionFormData } from '@/types/execution.types';
import { useToast } from './use-toast';

export function useExecutions(projectId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: executions, isLoading, error } = useQuery({
    queryKey: ['executions', projectId],
    queryFn: () => executionsService.getAll(projectId),
  });

  const { data: stats } = useQuery({
    queryKey: ['execution-stats', projectId],
    queryFn: () => executionsService.getStats(projectId),
  });

  const createMutation = useMutation({
    mutationFn: (data: ExecutionFormData) => executionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast.success('Test execution started');
    },
    onError: () => {
      toast.error('Failed to start execution');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => executionsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast.success('Execution cancelled');
    },
    onError: () => {
      toast.error('Failed to cancel execution');
    },
  });

  return {
    executions: executions || [],
    stats,
    isLoading,
    error,
    startExecution: createMutation.mutate,
    cancelExecution: cancelMutation.mutate,
    isStarting: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

export function useExecution(id: string) {
  const { data: execution, isLoading, error } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => executionsService.getById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if execution is running
      const data = query.state.data;
      return data?.status === 'running' ? 2000 : false;
    },
  });

  return { execution, isLoading, error };
}
