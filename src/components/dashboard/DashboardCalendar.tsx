'use client';

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import type { Problem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCalendarProps {
  problems: Problem[];
}

export default function DashboardCalendar({ problems }: DashboardCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [problemDates, setProblemDates] = useState<Date[]>([]);

  useEffect(() => {
    const dates = problems.map(p => new Date(p.datePosted + 'T00:00:00')); // Ensure correct date parsing
    setProblemDates(dates);
  }, [problems]);
  
  // Ensure component only renders on client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Activity Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={currentMonth} // Can be used to show 'today' or a selected date
          onSelect={(date) => date && setCurrentMonth(date)}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md"
          modifiers={{
            problemDay: problemDates,
          }}
          modifiersStyles={{
            problemDay: {
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: 'hsl(var(--primary))',
              borderRadius: 'var(--radius)',
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
