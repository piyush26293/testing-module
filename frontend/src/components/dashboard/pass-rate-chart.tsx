'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendData } from '@/types/report.types';

interface PassRateChartProps {
  data: TrendData[];
}

export function PassRateChart({ data }: PassRateChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pass Rate Trend (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [`${value}%`, 'Pass Rate']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="passRate"
                stroke="#22c55e"
                strokeWidth={2}
                name="Pass Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
