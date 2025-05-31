'use client';

import { useEffect, useState } from 'react';
import type { Problem } from '@/types';
import ProblemList from '@/components/dashboard/ProblemList';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { useAppState } from '@/components/AppStateProvider';
import problemsData from '@/data/problems.json';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, collectionGroup, deleteDoc, getDoc } from 'firebase/firestore';

async function getProblems(): Promise<Problem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(problemsData as Problem[]);
    }, 100);
  });
}

// Utility to get current IST date as YYYY-MM-DD
function getISTDateString() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  const ist = new Date(utc + istOffset);
  return ist.toISOString().slice(0, 10);
}

export default function HomePage() {
  const { currentUser, currentView } = useAppState();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();
  const [userList, setUserList] = useState<{ uid: string; email: string | null }[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthed(!!user);
      if (!user) {
        router.replace('/landing');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setIsClient(true);
    async function loadProblems() {
      setIsLoading(true);
      const fetchedProblems = await getProblems();
      setProblems(fetchedProblems);
      setIsLoading(false);
    }
    loadProblems();
  }, []);

  useEffect(() => {
    if (isClient && problems.length > 0 && isAuthed) {
      const fetchSolvedCount = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const solvedSnap = await getDocs(collection(db, 'users', user.uid, 'solvedProblems'));
        setSolvedCount(solvedSnap.size);
      };
      fetchSolvedCount();
    }
  }, [isClient, problems, currentUser, isAuthed]);

  // Admin-only: Save daily stats to Firestore
  const handleEndDayAndSaveStats = async () => {
    const user = auth.currentUser;
    if (!user || user.email !== 'ganeshvathumilli@gmail.com') return;
    const problemsPosted = problems.length;
    // Find all users with solvedProblems
    const solvedProblemsSnaps = await getDocs(collectionGroup(db, 'solvedProblems'));
    let koalaSolved = 0;
    let alpacaSolved = 0;
    for (const docSnap of solvedProblemsSnaps.docs) {
      const pathParts = docSnap.ref.path.split('/');
      const uid = pathParts[1];
      if (uid && docSnap.exists()) {
        if (uid === auth.currentUser.uid) {
          koalaSolved++;
        } else {
          alpacaSolved++;
        }
      }
    }
    // Get current cumulative stats
    const statsRef = doc(db, 'dailyStats', 'cumulative');
    const statsSnap = await getDoc(statsRef);
    let prevPosted = 0, prevKoala = 0, prevAlpaca = 0;
    if (statsSnap.exists()) {
      const data = statsSnap.data();
      prevPosted = data.problemsPosted || 0;
      prevKoala = data.koalaSolved || 0;
      prevAlpaca = data.alpacaSolved || 0;
    }
    // Update cumulative stats
    await setDoc(statsRef, {
      problemsPosted: prevPosted + problemsPosted,
      koalaSolved: prevKoala + koalaSolved,
      alpacaSolved: prevAlpaca + alpacaSolved
    });
    // Reset solvedProblems for all users
    for (const docSnap of solvedProblemsSnaps.docs) {
      await deleteDoc(docSnap.ref);
    }
    setSolvedCount(0);
    alert('Cumulative stats updated and reset!');
  };

  // Admin-only: List all user UIDs and emails who have solved at least one problem
  const fetchUserUIDs = async () => {
    // Find all users with solvedProblems
    const solvedProblemsSnaps = await getDocs(collectionGroup(db, 'solvedProblems'));
    const uids = new Set<string>();
    solvedProblemsSnaps.forEach(docSnap => {
      const pathParts = docSnap.ref.path.split('/');
      const uid = pathParts[1]; // users/{uid}/solvedProblems/{problemId}
      uids.add(uid);
    });
    // Fetch emails for those UIDs
    const users: { uid: string; email: string | null }[] = [];
    for (const uid of uids) {
      try {
        const user = await auth.getUser(uid);
        users.push({ uid, email: user.email });
      } catch {
        users.push({ uid, email: null });
      }
    }
    setUserList(users);
  };

  const renderDashboard = () => {
    if (!isClient || isLoading) {
      return (
        <div className="flex flex-col lg:flex-row gap-6 mt-24">
          <div className="lg:w-3/4 space-y-4">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="lg:w-1/4 space-y-4">
            <Skeleton className="h-[320px] w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col lg:flex-row gap-6 mt-24">
        <div className="lg:w-3/4">
          <ProblemList problems={problems} currentUser={currentUser} />
        </div>
        <aside className="lg:w-1/4 space-y-6">
          <DashboardCalendar problems={problems} currentUser={currentUser} />
          <Card className="w-[320px] mx-auto rounded-md border border-border/30 bg-card/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-headline">Stats ({currentUser === 'Koala' ? 'Koala' : 'Alpaca'})</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Total Problems Posted:</span>
                <span className="font-semibold">{problems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Problems Solved:</span>
                <span className="font-semibold">{solvedCount}</span>
              </div>
              {/* Admin-only End Day button */}
              {isAuthed && auth.currentUser?.email === 'ganeshvathumilli@gmail.com' && (
                <>
                  <button
                    onClick={handleEndDayAndSaveStats}
                    className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded font-bold text-base shadow hover:bg-primary/80 transition"
                  >
                    End Day & Save Stats
                  </button>
                  <button
                    onClick={fetchUserUIDs}
                    className="mt-2 w-full bg-muted text-foreground py-2 rounded font-bold text-base shadow hover:bg-muted/80 transition"
                  >
                    Show All User UIDs
                  </button>
                  {userList.length > 0 && (
                    <div className="mt-2 text-xs">
                      <div className="font-bold mb-1">User UIDs:</div>
                      {userList.map(u => (
                        <div key={u.uid} className="break-all">{u.uid} {u.email && `(${u.email})`}</div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          {/* UserSwitcher component was previously here, removed as per earlier request */}
        </aside>
      </div>
    );
  };

  const renderChart = () => {
    if (!isClient || isLoading) {
      return <Skeleton className="h-[400px] w-full rounded-lg mt-24" />;
    }
    return <div className="mt-24"><ProgressChart problems={problems} /></div>;
  };
  
  if (!isAuthed) return null;

  if (!isClient && !isLoading) {
     return (
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
         <div className="flex flex-col lg:flex-row gap-6 mt-24">
          <div className="lg:w-3/4 space-y-4">
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="lg:w-1/4 space-y-4">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-6xl">
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'chart' && renderChart()}
    </main>
  );
}
