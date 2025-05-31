
'use client';

import { useEffect, useState } from 'react';
import type { Problem } from '@/types';
import ProblemList from '@/components/dashboard/ProblemList';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import ProgressChart from '@/components/dashboard/ProgressChart'; // Import the new chart component
import { useAppState } from '@/components/AppStateProvider';
import problemsData from '@/data/problems.json';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getProblems(): Promise<Problem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API delay
      resolve(problemsData as Problem[]);
    }, 500);
  });
}

export default function HomePage() {
  const { currentUser } = useAppState();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function loadProblems() {
      setIsLoading(true);
      const fetchedProblems = await getProblems();
      setProblems(fetchedProblems);
      setIsLoading(false);
    }
    loadProblems();
  }, []);

  if (!isClient) {
    // Return a placeholder or null during SSR/pre-hydration to avoid issues with client-only components
    return (
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 h-10 w-full md:w-[600px] bg-muted rounded-md animate-pulse"></div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Tabs defaultValue="problems" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="chart">Progress Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="problems">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : (
            <ProblemList problems={problems} currentUser={currentUser} />
          )}
        </TabsContent>
        <TabsContent value="calendar">
           {isLoading ? (
             <Skeleton className="h-[420px] w-full rounded-lg" />
           ) : (
             <DashboardCalendar problems={problems} />
           )}
        </TabsContent>
        <TabsContent value="chart">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : (
            <ProgressChart problems={problems} />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
