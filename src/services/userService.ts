import { db } from '@/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import type { UserProfile } from '@/types';

export const userService = {
  async createUserProfile(uid: string, email: string, displayName: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    const userProfile: UserProfile = {
      uid,
      email,
      displayName,
      role: 'participant',
      joinedAt: new Date().toISOString(),
      settings: {
        theme: 'light',
        notifications: true
      }
    };
    await setDoc(userRef, userProfile);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
  },

  async updateUserRole(uid: string, role: 'admin' | 'participant'): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { role }, { merge: true });
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    return usersSnap.docs.map(doc => doc.data() as UserProfile);
  },

  async getParticipants(): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'participant'));
    const usersSnap = await getDocs(q);
    return usersSnap.docs.map(doc => doc.data() as UserProfile);
  }
}; 