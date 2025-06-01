'use client';

import { useState, useEffect } from 'react';
import type { Problem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, UserCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { auth } from '@/firebase';

interface ProblemItemProps {
  problem: Problem;
  currentUser: string | null;
  onProblemSolved?: () => void;
}

export default function ProblemItem({ problem, currentUser, onProblemSolved }: ProblemItemProps) {
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    const checkSolvedStatus = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const solvedRef = doc(db, 'users', user.uid, 'solvedProblems', problem.id.toString());
        const solvedDoc = await getDoc(solvedRef);
        setIsSolved(solvedDoc.exists());
      } catch (error) {
        console.error('Error checking solved status:', error);
      }
    };

    checkSolvedStatus();
  }, [problem.id]);

  const handleToggleSolved = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const solvedRef = doc(db, 'users', user.uid, 'solvedProblems', problem.id.toString());
      const solvedDoc = await getDoc(solvedRef);
      
      if (solvedDoc.exists()) {
        await deleteDoc(solvedRef);
      } else {
        await setDoc(solvedRef, {
          problemId: problem.id,
          problemName: problem.problemName,
          solvedAt: new Date().toISOString(),
          userId: user.uid
        });
      }
      
      setIsSolved(!isSolved);
      onProblemSolved?.();
    } catch (error) {
      console.error('Error toggling solved status:', error);
    }
  };

  const PostedByIcon = problem.postedBy === 'admin' ? UserCircle : Users;

  return (
    <Card className={`transition-all duration-300 ease-in-out ${isSolved ? 'opacity-60' : 'opacity-100'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`text-xl font-headline ${isSolved ? 'line-through' : ''}`}>{problem.problemName}</CardTitle>
            <CardDescription className="text-sm">
              Posted on: {new Date(problem.datePosted + 'T00:00:00').toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={problem.postedBy === 'admin' ? "secondary" : "outline"} className="capitalize">
              <PostedByIcon className="mr-1 h-4 w-4" />
              {problem.postedBy}
            </Badge>
            <Checkbox
              id={`checkbox-${problem.id}`}
              checked={isSolved}
              onCheckedChange={handleToggleSolved}
              aria-label={`Mark ${problem.problemName} as solved`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center text-sm text-primary hover:underline ${isSolved ? 'line-through' : ''}`}
        >
          View Problem <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}
