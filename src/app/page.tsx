
'use client';

import { useEffect, useState } from 'react';
import type { Problem } from '@/types';
import ProblemList from '@/components/dashboard/ProblemList';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { useAppState } from '@/components/AppStateProvider';
import problemsData from '@/data/problems.json';
import { Skeleton } from '@/components/ui/skeleton';

async function getProblems(): Promise<Problem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(problemsData as Problem[]);
    }, 500);
  });
}

export default function HomePage() {
  const { currentUser, currentView } = useAppState();
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

  const renderContent = () => {
    if (!isClient || isLoading) {
      // Shared Skeleton for loading state
      if (currentView === 'problems') {
        return (
          <div className="space-y-6 mt-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        );
      }
      if (currentView === 'calendar') {
        return <Skeleton className="h-[420px] w-full rounded-lg mt-6" />;
      }
      if (currentView === 'chart') {
        return <Skeleton className="h-[400px] w-full rounded-lg mt-6" />;
      }
      return null;
    }

    switch (currentView) {
      case 'problems':
        return <ProblemList problems={problems} currentUser={currentUser} />;
      case 'calendar':
        return <DashboardCalendar problems={problems} />;
      case 'chart':
        return <ProgressChart problems={problems} />;
      default:
        return null;
    }
  };
  
  // During SSR or before client-side hydration, if not loading, show a basic shell
  if (!isClient && !isLoading) {
     return (
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        <div className="space-y-6 mt-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
      <div className="mt-6">
        {renderContent()}
      </div>
    </main>
  );
}
