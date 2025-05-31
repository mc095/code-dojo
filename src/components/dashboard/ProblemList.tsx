'use client';

import type { Problem, UserRole } from '@/types';
import ProblemItem from './ProblemItem';

interface ProblemListProps {
  problems: Problem[];
  currentUser: UserRole;
}

export default function ProblemList({ problems, currentUser }: ProblemListProps) {
  if (!problems || problems.length === 0) {
    return <p className="text-muted-foreground">No problems posted yet. Check back later!</p>;
  }

  // Sort problems by date posted, newest first
  const sortedProblems = [...problems].sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline text-left mb-4">Today's Problems</h2>
      {sortedProblems.map((problem) => (
        <ProblemItem key={problem.id} problem={problem} currentUser={currentUser} />
      ))}
    </div>
  );
}
