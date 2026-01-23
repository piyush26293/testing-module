'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Analyze test trends and generate reports
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              View detailed analytics and export reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Reports and analytics will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
