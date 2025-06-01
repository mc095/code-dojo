'use client';

import type { Problem } from '@/types';
import ProblemItem from './ProblemItem';
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface ProblemListProps {
  problems: Problem[];
  currentUser: string | null;
  onSolvedCountChange?: (count: number) => void;
}

export default function ProblemList({ problems, currentUser, onSolvedCountChange }: ProblemListProps) {
  const [solvedCount, setSolvedCount] = useState(0);

  const fetchSolvedCount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const solvedSnap = await getDocs(collection(db, 'users', user.uid, 'solvedProblems'));
    const count = solvedSnap.size;
    setSolvedCount(count);
    onSolvedCountChange?.(count);
  };

  useEffect(() => {
    fetchSolvedCount();
  }, [currentUser]);

  const handleProblemSolved = () => {
    fetchSolvedCount();
  };

  if (!problems || problems.length === 0) {
    return <p className="text-muted-foreground">No problems posted yet. Check back later!</p>;
  }

  // Sort problems by date posted, newest first
  const sortedProblems = [...problems].sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline text-left mb-4">Today's Problems</h2>
      {sortedProblems.map((problem) => (
        <ProblemItem
          key={problem.id}
          problem={problem}
          currentUser={currentUser}
          onProblemSolved={handleProblemSolved}
        />
      ))}
    </div>
  );
}
