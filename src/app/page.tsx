
'use client';

import { useEffect, useState } from 'react';
import type { Problem } from '@/types';
import ProblemList from '@/components/dashboard/ProblemList';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { useAppState } from '@/components/AppStateProvider';
import problemsData from '@/data/problems.json';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getProblems(): Promise<Problem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(problemsData as Problem[]);
    }, 100);
  });
}

export default function HomePage() {
  const { currentUser, currentView } = useAppState();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

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

  useEffect(() => {
    if (isClient && problems.length > 0) {
      let count = 0;
      problems.forEach(problem => {
        const localStorageKey = `algoRace_solved_${problem.id}_${currentUser}`;
        if (localStorage.getItem(localStorageKey) === 'true') {
          count++;
        }
      });
      setSolvedCount(count);
    }
  }, [isClient, problems, currentUser]);

  const renderDashboard = () => {
    if (!isClient || isLoading) {
      return (
        <div className="flex flex-col lg:flex-row gap-6 mt-24"> {/* Added mt-24 for space below FloatingNav */}
          <div className="lg:w-3/4 space-y-4">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="lg:w-1/4 space-y-4">
            <Skeleton className="h-[320px] w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col lg:flex-row gap-6 mt-24"> {/* Added mt-24 */}
        <div className="lg:w-3/4">
          <ProblemList problems={problems} currentUser={currentUser} />
        </div>
        <aside className="lg:w-1/4 space-y-6">
          <DashboardCalendar problems={problems} currentUser={currentUser} />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-headline">Statistics ({currentUser === 'user' ? 'Me' : 'Cousin'})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Total Problems Posted:</span>
                <span className="font-semibold">{problems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Problems Solved:</span>
                <span className="font-semibold">{solvedCount}</span>
              </div>
            </CardContent>
          </Card>
          {/* UserSwitcher removed as per request */}
        </aside>
      </div>
    );
  };

  const renderChart = () => {
    if (!isClient || isLoading) {
      return <Skeleton className="h-[400px] w-full rounded-lg mt-24" />; {/* Added mt-24 */}
    }
    return <div className="mt-24"><ProgressChart problems={problems} /></div>; {/* Added mt-24 and wrapper div */}
  };
  
  if (!isClient && !isLoading) {
     return (
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl"> {/* max-w-4xl for narrower view */}
         <div className="flex flex-col lg:flex-row gap-6 mt-24"> {/* Added mt-24 */}
          <div className="lg:w-3/4 space-y-4">
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="lg:w-1/4 space-y-4">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl"> {/* max-w-4xl for narrower view */}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'chart' && renderChart()}
    </main>
  );
}
