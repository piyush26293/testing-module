'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { Execution } from '@/types/execution.types';
import Link from 'next/link';

interface RecentExecutionsProps {
  executions: Execution[];
}

export function RecentExecutions({ executions }: RecentExecutionsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Test Executions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {executions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent executions</p>
          ) : (
            executions.slice(0, 5).map((execution) => (
              <Link
                key={execution.id}
                href={`/dashboard/executions/${execution.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {execution.testCaseName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(execution.startedAt)}
                  </p>
                </div>
                <Badge variant={getStatusColor(execution.status) as any}>
                  {execution.status}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
