'use client'; // This page now needs to be a client component to use the AppStateContext hook

import { useEffect, useState } from 'react';
import type { Problem } from '@/types';
import ProblemList from '@/components/dashboard/ProblemList';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import { useAppState } from '@/components/AppStateProvider'; // Import the hook
import problemsData from '@/data/problems.json'; // Import problems directly
import { Skeleton } from '@/components/ui/skeleton';

// Simulate fetching data, or read from imported JSON
async function getProblems(): Promise<Problem[]> {
  // In a real scenario, this could be an API call.
  // For now, we use the imported JSON.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(problemsData as Problem[]);
    }, 500); // Simulate network delay
  });
}

export default function HomePage() {
  const { currentUser } = useAppState(); // Use the hook to get currentUser
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
    // Render nothing or a basic SSR fallback until client takes over
    return null;
  }


  return (
    <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <h2 className="text-3xl font-bold mb-6 text-foreground font-headline">Daily Problems</h2>
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : (
            <ProblemList problems={problems} currentUser={currentUser} />
          )}
        </div>
        <div className="lg:col-span-1 order-1 lg:order-2">
           {isLoading ? (
             <Skeleton className="h-[380px] w-full rounded-lg" />
           ) : (
             <DashboardCalendar problems={problems} />
           )}
        </div>
      </div>
    </main>
  );
}
