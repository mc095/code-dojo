'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userService } from '@/services/userService';
import type { UserProfile } from '@/types';
import { auth, db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface UserStats {
  uid: string;
  displayName: string;
  solvedCount: number;
  lastSolved: string | null;
  streak: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setError(null);
      const allUsers = await userService.getAllUsers();
      if (!allUsers || allUsers.length === 0) {
        setUsers([]);
        setUserStats([]);
        return;
      }
      setUsers(allUsers);

      // Get solved problems count for each user
      const stats: UserStats[] = [];
      for (const user of allUsers) {
        if (!user.uid) continue;
        
        try {
          const solvedProblemsRef = collection(db, 'users', user.uid, 'solvedProblems');
          const solvedQuery = query(solvedProblemsRef, where('solvedAt', '!=', null));
          const solvedSnap = await getDocs(solvedQuery);
          
          // Calculate streak and last solved date
          const solvedDates = solvedSnap.docs
            .map(doc => {
              const data = doc.data();
              return data.solvedAt ? new Date(data.solvedAt).toISOString().split('T')[0] : null;
            })
            .filter((date): date is string => date !== null);
          
          const lastSolved = solvedDates.length > 0 ? solvedDates.sort().pop() || null : null;
          
          // Calculate streak (consecutive days with solved problems)
          let streak = 0;
          if (solvedDates.length > 0) {
            const sortedDates = [...new Set(solvedDates)].sort();
            let currentStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
              const prevDate = new Date(sortedDates[i - 1]);
              const currDate = new Date(sortedDates[i]);
              const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                currentStreak++;
              } else {
                currentStreak = 1;
              }
              streak = Math.max(streak, currentStreak);
            }
          }

          stats.push({
            uid: user.uid,
            displayName: user.displayName || user.email || 'Unknown User',
            solvedCount: solvedSnap.size,
            lastSolved,
            streak
          });
        } catch (error) {
          console.error(`Error loading stats for user ${user.uid}:`, error);
          stats.push({
            uid: user.uid,
            displayName: user.displayName || user.email || 'Unknown User',
            solvedCount: 0,
            lastSolved: null,
            streak: 0
          });
        }
      }
      
      // Sort by solved count
      stats.sort((a, b) => b.solvedCount - a.solvedCount);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium">Total Problems Solved</p>
                <p className="text-2xl font-bold">
                  {userStats.reduce((sum, stat) => sum + stat.solvedCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 