'use client';

import { useEffect, useState } from 'react';
import type { Problem } from '@/types';
import ProblemList from '@/components/dashboard/ProblemList';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import { useAppState } from '@/components/AppStateProvider';
import problemsData from '@/data/problems.json';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, collectionGroup, deleteDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { signInWithPopup } from 'firebase/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserStats {
  uid: string;
  displayName: string;
  solvedCount: number;
  lastSolved: string | null;
  streak: number;
}

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
  const { currentUser, currentView, isAdmin, userProfile } = useAppState();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [stats, setStats] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [solvedCount, setSolvedCount] = useState(0);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userList, setUserList] = useState<{ uid: string; email: string | null }[]>([]);

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthed(!!user);
      if (user) {
        // Create or update user profile
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // New user - create profile with email name
          const emailName = user.email?.split('@')[0] || 'User';
          await setDoc(userRef, {
            email: user.email,
            displayName: emailName,
            role: 'user',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        router.push('/landing');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isClient && problems.length > 0 && isAuthed) {
      const fetchSolvedCount = async () => {
        const user = auth.currentUser;
        if (!user) return;
        
        try {
          const solvedRef = collection(db, 'users', user.uid, 'solvedProblems');
          const solvedSnap = await getDocs(solvedRef);
          setSolvedCount(solvedSnap.size);
        } catch (error) {
          console.error('Error fetching solved count:', error);
        }
      };
      fetchSolvedCount();
    }
  }, [isClient, problems, currentUser, isAuthed]);

  // Add this new useEffect to fetch user list and stats
  useEffect(() => {
    const fetchUserListAndStats = async () => {
      try {
        // Get all users
        const usersSnap = await getDocs(collection(db, 'users'));
        const users: { uid: string; email: string | null }[] = [];
        const userStats: UserStats[] = [];

        // Get the latest daily stats
        const statsRef = doc(db, 'dailyStats', 'cumulative');
        const statsDoc = await getDoc(statsRef);
        const dailyStats = statsDoc.exists() ? statsDoc.data() : null;

        for (const userDoc of usersSnap.docs) {
          const userData = userDoc.data();
          const uid = userDoc.id;
          
          users.push({
            uid,
            email: userData.email
          });

          // Get solved count from dailyStats
          const solvedCount = dailyStats?.userStats?.[uid] || 0;
          
          userStats.push({
            uid,
            displayName: userData.displayName || userData.email?.split('@')[0] || 'Unknown User',
            solvedCount,
            lastSolved: dailyStats?.date || null,
            streak: 0 // We'll calculate this separately if needed
          });
        }

        setUserList(users);
        setStats(userStats);
      } catch (error) {
        console.error('Error fetching user list and stats:', error);
      }
    };

    if (isClient && isAuthed) {
      fetchUserListAndStats();
    }
  }, [isClient, isAuthed]);

  // Update the admin stats saving function
  const handleEndDayAndSaveStats = async () => {
    const user = auth.currentUser;
    if (!user || !isAdmin) return;
    
    try {
      const problemsPosted = problems.length;
      const today = getISTDateString();

      // Get all users
      const usersSnap = await getDocs(collection(db, 'users'));
      const userStats: { [key: string]: number } = {};
      
      // Count solved problems for each user
      for (const userDoc of usersSnap.docs) {
        const solvedSnap = await getDocs(collection(db, 'users', userDoc.id, 'solvedProblems'));
        userStats[userDoc.id] = solvedSnap.size;
      }

      // Update cumulative stats
      const statsRef = doc(db, 'dailyStats', 'cumulative');
      await setDoc(statsRef, {
        date: today,
        problemsPosted,
        userStats,
        lastUpdated: new Date().toISOString()
      });

      // Reset solvedProblems for all users
      for (const userDoc of usersSnap.docs) {
        const solvedSnap = await getDocs(collection(db, 'users', userDoc.id, 'solvedProblems'));
        for (const solvedDoc of solvedSnap.docs) {
          await deleteDoc(solvedDoc.ref);
        }
      }
      
      setSolvedCount(0);
      alert('Stats updated and reset!');
    } catch (error) {
      console.error('Error saving stats:', error);
      alert('Error saving stats. Please try again.');
    }
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
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          users.push({ uid, email: data.email || null });
        } else {
          users.push({ uid, email: null });
        }
      } catch {
        users.push({ uid, email: null });
      }
    }
    setUserList(users);
  };

  const handleSolvedCountChange = (count: number) => {
    setSolvedCount(count);
  };

  const renderChart = () => {
    if (!isClient || isLoading) {
      return <Skeleton className="h-[400px] w-full rounded-lg mt-24" />;
    }

    if (userList.length === 0) {
      return (
        <div className="mt-24">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="mt-24 space-y-6">
        <Card className="border-2">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <span>Progress Overview</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({problems.length} Total Problems)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-8">
              {userList.map(user => {
                const userStats = stats.find(s => s.uid === user.uid);
                const solvedCount = userStats?.solvedCount || 0;
                const totalProblems = problems.length;
                const completionRate = totalProblems > 0 
                  ? Math.round((solvedCount / totalProblems) * 100) 
                  : 0;

                return (
                  <div key={user.uid} className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold tracking-tight">
                          {user.email?.split('@')[0] || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Problems Solved</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-primary">{solvedCount}</p>
                          <p className="text-sm text-muted-foreground">/ {totalProblems}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Completion Rate</span>
                        <span className="font-medium text-primary">{completionRate}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Solved Today</p>
                        <p className="text-2xl font-bold mt-1">{userStats?.solvedCount || 0}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="text-2xl font-bold mt-1">
                          {userStats?.lastSolved ? new Date(userStats.lastSolved).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
          <ProblemList 
            problems={problems} 
            currentUser={currentUser} 
            onSolvedCountChange={handleSolvedCountChange}
          />
        </div>
        <aside className="lg:w-1/4 space-y-6">
          <DashboardCalendar problems={problems} currentUser={currentUser} />
          <Card className="w-[320px] mx-auto rounded-md border border-border/30 bg-card/90">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-headline">Stats ({userProfile?.displayName || 'User'})</CardTitle>
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
              {isAdmin && (
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
        </aside>
      </div>
    );
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
