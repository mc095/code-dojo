
'use client';

import { useAppState } from '@/components/AppStateProvider';
import { Button } from '@/components/ui/button';
import { ListChecks, CalendarDays, LineChart } from 'lucide-react';

export default function Header() {
  const { currentView, setCurrentView } = useAppState();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary mr-2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              <path d="M18 22H7"></path>
              <path d="M12 16l-2-2 2-2"></path>
              <path d="m12 12 4 4"></path>
              <path d="m12 12 4-4"></path>
            </svg>
            <h1 className="text-2xl font-bold text-foreground font-headline">AlgoRace</h1>
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant={currentView === 'problems' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('problems')}
              className="font-medium"
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Problems
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('calendar')}
              className="font-medium"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={currentView === 'chart' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('chart')}
              className="font-medium"
            >
              <LineChart className="mr-2 h-4 w-4" />
              Progress
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
