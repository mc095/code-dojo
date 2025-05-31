
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
          datesWithActivity.add(problem.datePosted);
        }
      });
      setActivityDates(Array.from(datesWithActivity).map(dateStr => new Date(dateStr + 'T00:00:00')));
    }
  }, [problems, currentUser, isClient]);
  

  if (!isClient) {
    return <Skeleton className="h-[320px] w-full rounded-lg" />; 
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline">Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0"> {/* Removed flex justify-center */}
        <Calendar
          mode="single"
          selected={currentMonth}
          onSelect={(date) => date && setCurrentMonth(date)}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md w-full" // Ensure calendar takes full width of card content, removed scaling
          modifiers={{
            activityDay: activityDates,
          }}
          modifiersStyles={{
            activityDay: {
              color: 'hsl(var(--primary-foreground))',
              backgroundColor: 'hsl(var(--primary))',
              borderRadius: '9999px',
              width: '8px',
              height: '8px',
              margin: 'auto', 
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
                <div className="relative w-full h-full flex items-center justify-center">
                  <span>{props.date.getDate()}</span>
                  {isActivityDay && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'hsl(var(--primary))',
                      }}
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
