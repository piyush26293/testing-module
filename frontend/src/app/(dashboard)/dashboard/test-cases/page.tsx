'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TestCasesPage() {
  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Test Cases</h1>
            <p className="text-muted-foreground mt-2">
              Manage and organize your test cases
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Test Case
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
            <CardDescription>
              Create and manage your automated test cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Test cases will be displayed here. Create your first test case to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
