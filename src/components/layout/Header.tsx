
'use client';

import { useAppState } from '@/components/AppStateProvider';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LineChart } from 'lucide-react';

export default function Header() {
  const { currentView, setCurrentView } = useAppState();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end h-16">
          <nav className="flex items-center space-x-2">
            <Button
              variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('dashboard')}
              className="font-medium"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
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
