'use client';

import { useState, useEffect } from 'react';
import type { Problem, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, UserCircle, Users } from 'lucide-react'; // Assuming UserCircle for Ganesh, Users for Vaishnavi
import { Badge } from '@/components/ui/badge';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { auth } from '@/firebase';

interface ProblemItemProps {
  problem: Problem;
  currentUser: UserRole;
}

export default function ProblemItem({ problem, currentUser }: ProblemItemProps) {
  const localStorageKey = `algoRace_solved_${problem.id}_${currentUser}`;
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    const fetchSolved = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, 'users', user.uid, 'solvedProblems', problem.id);
      const docSnap = await getDoc(docRef);
      setIsSolved(docSnap.exists() && docSnap.data().solved === true);
    };
    fetchSolved();
  }, [problem.id]);

  const handleToggleSolved = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'solvedProblems', problem.id);
    if (!isSolved) {
      await setDoc(docRef, { solved: true, date: new Date().toISOString() });
      setIsSolved(true);
    } else {
      await deleteDoc(docRef);
      setIsSolved(false);
    }
  };

  // Koala is the primary user, Alpaca is the secondary
  const PostedByIcon = problem.postedBy === 'Koala' ? UserCircle : Users;

  return (
    <Card className={`transition-all duration-300 ease-in-out ${isSolved ? 'opacity-60' : 'opacity-100'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={`text-xl font-headline ${isSolved ? 'line-through' : ''}`}>{problem.problemName}</CardTitle>
            <CardDescription className="text-sm">
              Posted on: {new Date(problem.datePosted  + 'T00:00:00').toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
             <Badge variant={problem.postedBy === 'Koala' ? "secondary" : "outline"} className="capitalize">
              <PostedByIcon className="mr-1 h-4 w-4" />
              {problem.postedBy}
            </Badge>
            <Checkbox
              id={`checkbox-${problem.id}-${currentUser}`}
              checked={isSolved}
              onCheckedChange={handleToggleSolved}
              aria-label={`Mark ${problem.problemName} as solved for ${currentUser}`}
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
