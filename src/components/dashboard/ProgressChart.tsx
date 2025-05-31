
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
  "Ganesh's Progress": number;
  "Vaishnavi's Progress": number;
}

const chartConfig = {
  ganeshProgress: {
    label: "Ganesh's Progress",
    color: 'hsl(var(--chart-1))',
  },
  vaishnaviProgress: {
    label: "Vaishnavi's Progress",
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
        let ganeshSolvedCount = 0;
        let vaishnaviSolvedCount = 0;
        const targetDate = new Date(currentDateISO + 'T00:00:00');

        problems.forEach(problem => {
          if (new Date(problem.datePosted + 'T00:00:00') <= targetDate) {
            const ganeshSolved = localStorage.getItem(`algoRace_solved_${problem.id}_Ganesh`) === 'true';
            const vaishnaviSolved = localStorage.getItem(`algoRace_solved_${problem.id}_Vaishnavi`) === 'true';
            if (ganeshSolved) ganeshSolvedCount++;
            if (vaishnaviSolved) vaishnaviSolvedCount++;
          }
        });
        
        return {
          date: format(targetDate, 'MMM d'),
          originalDate: currentDateISO,
          "Ganesh's Progress": ganeshSolvedCount,
          "Vaishnavi's Progress": vaishnaviSolvedCount,
        };
      });
      
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
          <CardDescription>Track Ganesh's and Vaishnavi's problem-solving journey.</CardDescription>
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
                dataKey="Ganesh's Progress"
                stroke={chartConfig.ganeshProgress.color}
                strokeWidth={2}
                dot={true}
                name="Ganesh's Progress"
              />
              <Line
                type="monotone"
                dataKey="Vaishnavi's Progress"
                stroke={chartConfig.vaishnaviProgress.color}
                strokeWidth={2}
                dot={true}
                name="Vaishnavi's Progress"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
