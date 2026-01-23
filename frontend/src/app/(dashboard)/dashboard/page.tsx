'use client';

import { useProjects } from '@/hooks/use-projects';
import { useExecutions } from '@/hooks/use-executions';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentExecutions } from '@/components/dashboard/recent-executions';
import { PassRateChart } from '@/components/dashboard/pass-rate-chart';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { LoadingSpinner } from '@/components/ui/loading';
import { FolderKanban, FileCheck, Play, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { projects, isLoading: projectsLoading } = useProjects();
  const { executions, stats, isLoading: executionsLoading } = useExecutions();

  if (projectsLoading || executionsLoading) {
    return <LoadingSpinner className="h-64" />;
  }

  // Generate mock trend data for the chart
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString(),
      passed: Math.floor(Math.random() * 50) + 30,
      failed: Math.floor(Math.random() * 20) + 5,
      total: 0,
      passRate: Math.floor(Math.random() * 30) + 60,
    };
  });

  const totalTestCases = projects.reduce((acc, p) => acc + (p.testCaseCount || 0), 0);

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here&apos;s an overview of your testing platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Projects"
            value={projects.length}
            description="Active projects"
            icon={FolderKanban}
          />
          <StatsCard
            title="Test Cases"
            value={totalTestCases}
            description="Total test cases"
            icon={FileCheck}
          />
          <StatsCard
            title="Executions"
            value={stats?.total || 0}
            description="Total test runs"
            icon={Play}
          />
          <StatsCard
            title="Pass Rate"
            value={`${stats?.passRate?.toFixed(1) || 0}%`}
            description="Overall success rate"
            icon={TrendingUp}
            trend={{
              value: 5.2,
              isPositive: true,
            }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PassRateChart data={trendData} />
          <RecentExecutions executions={executions} />
        </div>
      </div>
    </div>
  );
}
