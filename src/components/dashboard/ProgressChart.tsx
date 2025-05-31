
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Problem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ProgressChartProps {
  problems: Problem[];
}

interface ChartDataPoint {
  date: string; // Formatted date e.g., "MMM d"
  originalDate: string; // YYYY-MM-DD for sorting
  'My Progress': number;
  "Cousin's Progress": number;
}

const chartConfig = {
  myProgress: {
    label: 'My Progress',
    color: 'hsl(var(--chart-1))',
  },
  cousinProgress: {
    label: "Cousin's Progress",
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function ProgressChart({ problems }: ProgressChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && problems.length > 0) {
      const allDates = Array.from(new Set(problems.map(p => p.datePosted))).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      if (allDates.length === 0) {
        setChartData([]);
        return;
      }
      
      const processedData = allDates.map(currentDateISO => {
        let userSolvedCount = 0;
        let cousinSolvedCount = 0;
        const targetDate = new Date(currentDateISO + 'T00:00:00');

        problems.forEach(problem => {
          if (new Date(problem.datePosted + 'T00:00:00') <= targetDate) {
            const userSolved = localStorage.getItem(`algoRace_solved_${problem.id}_user`) === 'true';
            const cousinSolved = localStorage.getItem(`algoRace_solved_${problem.id}_cousin`) === 'true';
            if (userSolved) userSolvedCount++;
            if (cousinSolved) cousinSolvedCount++;
          }
        });
        
        return {
          date: format(targetDate, 'MMM d'),
          originalDate: currentDateISO,
          'My Progress': userSolvedCount,
          "Cousin's Progress": cousinSolvedCount,
        };
      });
      
      // Further sort by originalDate just in case format messes order for some locales, though unlikely with 'MMM d'
      processedData.sort((a,b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime());

      setChartData(processedData);
    }
  }, [isClient, problems]);

  if (!isClient) {
    return <div className="h-[400px] w-full rounded-lg bg-muted animate-pulse" />;
  }

  if (problems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>No problems posted yet to show progress.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (chartData.length === 0 && problems.length > 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
          <CardDescription>Track your and your cousin's problem-solving journey.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
           <p className="text-muted-foreground">No problems solved yet, or still loading solved data.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Over Time</CardTitle>
        <CardDescription>Cumulative problems solved by date posted.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 0,
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
              <Legend />
              <Line
                type="monotone"
                dataKey="My Progress"
                stroke={chartConfig.myProgress.color}
                strokeWidth={2}
                dot={true}
                name="My Progress"
              />
              <Line
                type="monotone"
                dataKey="Cousin's Progress"
                stroke={chartConfig.cousinProgress.color}
                strokeWidth={2}
                dot={true}
                name="Cousin's Progress"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

