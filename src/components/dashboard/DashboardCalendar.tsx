
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
        // Check if the problem was posted on or before the current date being processed by the calendar for activity
        // AND if it's solved by the current user.
        // The calendar highlights activity for the problem's *post date*.
        const localStorageKey = `algoRace_solved_${problem.id}_${currentUser}`;
        const isSolved = localStorage.getItem(localStorageKey) === 'true';
        if (isSolved) {
          const problemDate = new Date(problem.datePosted + 'T00:00:00'); // Ensure correct date parsing
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
    <Card className="transition-all duration-300 ease-in-out">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline">Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex justify-center">
        <Calendar
          mode="single"
          selected={currentMonth} // Displaying current month, not selecting a day
          onSelect={(date) => date && setCurrentMonth(date)} // Allow month navigation by clicking a day (optional)
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md w-full max-w-[340px] mx-auto" // Adjusted width and centering
          classNames={{
            caption_label: "text-base font-medium", // Slightly larger caption
            head_cell: "text-muted-foreground rounded-md w-9 h-9 font-normal text-[0.85rem]", // Slightly larger head cells
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20", // Slightly larger cells
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-sm", // Slightly larger day numbers
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
            day_disabled: "text-muted-foreground opacity-50",
          }}
          modifiers={{
            activityDay: activityDates,
          }}
          modifiersStyles={{
            activityDay: {}, // Style for the dot will be handled by DayContent
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
                        bottom: '5px', // Adjusted position for larger cells
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '6px', // Slightly larger dot
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
