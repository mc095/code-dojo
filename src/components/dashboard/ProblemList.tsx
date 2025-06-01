'use client';

import type { Problem } from '@/types';
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { collection, getDocs, collectionGroup, getDoc, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { setDoc, deleteDoc } from 'firebase/firestore';

interface ProblemListProps {
  problems: Problem[];
  currentUser: string | null;
  onSolvedCountChange?: (count: number) => void;
}

export default function ProblemList({ problems, currentUser, onSolvedCountChange }: ProblemListProps) {
  const [solvedCount, setSolvedCount] = useState(0);
  const [solvedProblems, setSolvedProblems] = useState<{ [key: string]: boolean }>({});
  const [solutions, setSolutions] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [isCommenting, setIsCommenting] = useState<{ [key: string]: boolean }>({});
  const [allSolutions, setAllSolutions] = useState<{ [problemId: string]: { [userId: string]: { solution: string, timestamp: string } } }>({});
  const [userEmails, setUserEmails] = useState<{ [userId: string]: string }>({});

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

  const fetchUserEmails = async (userIds: string[]) => {
    try {
      const emails: { [userId: string]: string } = {};
      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          emails[userId] = userDoc.data().email || 'Unknown User';
        }
      }
      setUserEmails(emails);
    } catch (error) {
      console.error('Error fetching user emails:', error);
    }
  };

  const fetchAllSolutions = async (problemId: string) => {
    try {
      const solutionsSnap = await getDocs(collectionGroup(db, 'solutions'));
      const solutions: { [userId: string]: { solution: string, timestamp: string } } = {};
      const userIds: string[] = [];
      
      solutionsSnap.forEach(doc => {
        if (doc.id === problemId) {
          const userId = doc.ref.parent.parent?.id;
          if (userId) {
            solutions[userId] = doc.data() as { solution: string, timestamp: string };
            userIds.push(userId);
          }
        }
      });

      setAllSolutions(prev => ({
        ...prev,
        [problemId]: solutions
      }));

      await fetchUserEmails(userIds);
    } catch (error) {
      console.error('Error fetching solutions:', error);
    }
  };

  const handleProblemSolved = async (problemId: string, solved: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const solvedRef = doc(db, 'users', user.uid, 'solvedProblems', problemId);
      
      if (solved) {
        await setDoc(solvedRef, { solved: true });
        await fetchAllSolutions(problemId);
      } else {
        await deleteDoc(solvedRef);
      }

      setSolvedProblems(prev => ({ ...prev, [problemId]: solved }));
      
      // Update solved count
      const solvedSnap = await getDocs(collection(db, 'users', user.uid, 'solvedProblems'));
      onSolvedCountChange?.(solvedSnap.size);
    } catch (error) {
      console.error('Error updating solved status:', error);
      alert('Error updating solved status. Please try again.');
    }
  };

  const handleAddSolution = async (problemId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSubmitting(prev => ({ ...prev, [problemId]: true }));
    try {
      const solutionRef = doc(db, 'users', user.uid, 'solutions', problemId);
      await setDoc(solutionRef, {
        solution: solutions[problemId],
        timestamp: new Date().toISOString()
      });

      await fetchAllSolutions(problemId);
      alert('Solution added successfully!');
    } catch (error) {
      console.error('Error adding solution:', error);
      alert('Error adding solution. Please try again.');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [problemId]: false }));
    }
  };

  const handleAddComment = async (problemId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setIsCommenting(prev => ({ ...prev, [problemId]: true }));
    try {
      const commentRef = doc(db, 'users', user.uid, 'comments', problemId);
      await setDoc(commentRef, {
        comment: comments[problemId],
        timestamp: new Date().toISOString()
      });

      alert('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setIsCommenting(prev => ({ ...prev, [problemId]: false }));
    }
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
        <Card key={problem.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={solvedProblems[problem.id] || false}
                onCheckedChange={(checked) => handleProblemSolved(problem.id, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{problem.problemName}</h3>
                  <a 
                    href={problem.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Problem
                  </a>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {problem.difficulty && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {problem.difficulty}
                      </span>
                    )}
                    {problem.tags?.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded bg-muted text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {solvedProblems[problem.id] && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Add your solution (optional):</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSolution(problem.id)}
                          disabled={isSubmitting[problem.id] || !solutions[problem.id]}
                        >
                          {isSubmitting[problem.id] ? 'Submitting...' : 'Submit Solution'}
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Write your solution here..."
                        value={solutions[problem.id] || ''}
                        onChange={(e) => setSolutions(prev => ({ ...prev, [problem.id]: e.target.value }))}
                        className="font-mono"
                        rows={4}
                      />

                      {allSolutions[problem.id] && Object.entries(allSolutions[problem.id]).length > 0 && (
                        <div className="mt-6 space-y-4">
                          <h4 className="font-medium">Solutions from others:</h4>
                          {Object.entries(allSolutions[problem.id]).map(([userId, data]) => (
                            <div key={userId} className="bg-muted/50 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">
                                  {userEmails[userId] || 'Unknown User'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(data.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <pre className="whitespace-pre-wrap font-mono text-sm bg-background p-2 rounded">
                                {data.solution}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
