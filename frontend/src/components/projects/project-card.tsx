'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project.types';
import { formatDateTime } from '@/lib/utils';
import { MoreVertical, Play } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/dashboard/projects/${project.id}`}>
              <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                {project.name}
              </CardTitle>
            </Link>
            <CardDescription className="mt-2">
              {project.description || 'No description'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Test Cases</span>
            <span className="font-medium">{project.testCaseCount || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
              {project.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Run</span>
            <span className="text-xs">
              {project.lastExecutionAt
                ? formatDateTime(project.lastExecutionAt)
                : 'Never'}
            </span>
          </div>
          <div className="pt-3 flex gap-2">
            <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                View Details
              </Button>
            </Link>
            <Button variant="default" size="sm">
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
