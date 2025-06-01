'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Problem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface ProgressData {
  date: string;
  problemsPosted: number;
  koalaSolved: number;
  alpacaSolved: number;
}

interface ChartDataPoint {
  date: string;
  originalDate: string;
  "Koala's Progress": number;
  "Alpaca's Progress": number;
}

const chartConfig = {
  koalaProgress: {
    label: "Koala's Progress",
    color: 'hsl(var(--chart-1))',
  },
  alpacaProgress: {
    label: "Alpaca's Progress",
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function ProgressChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const fetchChartData = async () => {
        try {
          const statsRef = doc(db, 'dailyStats', 'cumulative');
          const statsSnap = await getDoc(statsRef);
          
          if (statsSnap.exists()) {
            const data = statsSnap.data() as ProgressData;
            const formattedData: ChartDataPoint = {
              date: format(new Date(data.date), 'MMM d'),
              originalDate: data.date,
              "Koala's Progress": data.koalaSolved,
              "Alpaca's Progress": data.alpacaSolved
            };
            setChartData([formattedData]);
          }
        } catch (error) {
          console.error('Error fetching progress data:', error);
        }
      };

      fetchChartData();
    }
  }, [isClient]);

  if (!isClient) {
    return <div className="h-[400px] w-full rounded-lg bg-muted animate-pulse" />;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>Track Koala's and Alpaca's problem-solving journey.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Over Time</CardTitle>
        <CardDescription>Compare Koala's and Alpaca's problem-solving journey</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                domain={['dataMin', 'dataMax']}
              />
              <Tooltip
                content={<ChartTooltipContent />}
                cursorStyle={{ strokeDasharray: '3 3', stroke: 'hsl(var(--muted-foreground))' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm font-medium">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="Koala's Progress"
                stroke={chartConfig.koalaProgress.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Koala's Progress"
              />
              <Line
                type="monotone"
                dataKey="Alpaca's Progress"
                stroke={chartConfig.alpacaProgress.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Alpaca's Progress"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
