import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { useToast } from './use-toast';

export function useReports(projectId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports', projectId],
    queryFn: () => reportsService.getAll(projectId),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      projectId: string;
      name: string;
      type: string;
      startDate: string;
      endDate: string;
    }) => reportsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report created successfully');
    },
    onError: () => {
      toast.error('Failed to create report');
    },
  });

  const exportPdfMutation = useMutation({
    mutationFn: (id: string) => reportsService.exportPdf(id),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported to PDF');
    },
    onError: () => {
      toast.error('Failed to export report');
    },
  });

  const exportExcelMutation = useMutation({
    mutationFn: (id: string) => reportsService.exportExcel(id),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported to Excel');
    },
    onError: () => {
      toast.error('Failed to export report');
    },
  });

  return {
    reports: reports || [],
    isLoading,
    error,
    createReport: createMutation.mutate,
    exportPdf: exportPdfMutation.mutate,
    exportExcel: exportExcelMutation.mutate,
    isCreating: createMutation.isPending,
    isExporting: exportPdfMutation.isPending || exportExcelMutation.isPending,
  };
}

export function useReport(id: string) {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsService.getById(id),
    enabled: !!id,
  });

  return { report, isLoading, error };
}

export function useTrends(projectId: string, days: number = 30) {
  const { data: trends, isLoading, error } = useQuery({
    queryKey: ['trends', projectId, days],
    queryFn: () => reportsService.getTrends(projectId, days),
    enabled: !!projectId,
  });

  return { trends, isLoading, error };
}
