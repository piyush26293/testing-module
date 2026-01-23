'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function AIGeneratorPage() {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Test Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate test cases automatically using AI
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Test from URL</CardTitle>
            <CardDescription>
              Provide a URL and description to generate automated test cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Website URL
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  User Flow Description
                </label>
                <textarea
                  id="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe the user flow you want to test..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Test Cases
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
