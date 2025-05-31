'use client';

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import type { Problem, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardCalendarProps {
  problems: Problem[];
  currentUser: UserRole;
}

export default function DashboardCalendar({ problems, currentUser }: DashboardCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activityDates, setActivityDates] = useState<Date[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && problems.length > 0) {
      const datesWithActivity = new Set<string>();
      problems.forEach(problem => {
        const localStorageKey = `algoRace_solved_${problem.id}_${currentUser}`;
        const isSolved = localStorage.getItem(localStorageKey) === 'true';
        if (isSolved) {
          const problemDate = new Date(problem.datePosted + 'T00:00:00');
          datesWithActivity.add(problemDate.toISOString().split('T')[0]);
        }
      });
      setActivityDates(Array.from(datesWithActivity).map(dateStr => new Date(dateStr + 'T00:00:00')));
    }
  }, [problems, currentUser, isClient]);


  if (!isClient) {
    return <Skeleton className="h-[320px] w-full max-w-[340px] mx-auto rounded-lg" />;
  }

  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-lg rounded-md border border-border/30 bg-card/90 w-[320px] mx-auto">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-base font-headline">Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex justify-center items-center">
        <Calendar
          mode="single"
          selected={currentMonth}
          onSelect={(date) => date && setCurrentMonth(date)}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md w-[300px] mx-auto"
          modifiers={{
            activityDay: activityDates,
          }}
          modifiersStyles={{
            activityDay: {
              backgroundColor: 'hsl(var(--primary)/0.12)',
              borderRadius: '50%',
            },
          }}
          components={{
            DayContent: (props) => {
              const isActivityDay = activityDates.some(
                (activityDate) =>
                  activityDate.getFullYear() === props.date.getFullYear() &&
                  activityDate.getMonth() === props.date.getMonth() &&
                  activityDate.getDate() === props.date.getDate()
              );
              return (
                <div className="relative w-full h-full flex items-center justify-center group">
                  <span className="group-hover:scale-105 transition-transform duration-200 font-medium text-sm">{props.date.getDate()}</span>
                  {isActivityDay && (
                    <span
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary transition-all duration-200 group-hover:scale-110 shadow"
                    />
                  )}
                </div>
              );
            },
          }}
        />
      </CardContent>
    </Card>
  );
}

