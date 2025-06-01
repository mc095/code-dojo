import { db } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

export async function resetFirestore() {
  try {
    // Delete all documents in solvedProblems subcollections
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const userDoc of usersSnap.docs) {
      const solvedSnap = await getDocs(collection(db, 'users', userDoc.id, 'solvedProblems'));
      for (const solvedDoc of solvedSnap.docs) {
        await deleteDoc(solvedDoc.ref);
      }
    }

    // Delete all daily stats
    const statsSnap = await getDocs(collection(db, 'dailyStats'));
    for (const statDoc of statsSnap.docs) {
      await deleteDoc(statDoc.ref);
    }

    // Initialize daily stats
    const statsRef = doc(db, 'dailyStats', 'cumulative');
    await setDoc(statsRef, {
      date: new Date().toISOString().split('T')[0],
      problemsPosted: 0,
      userStats: {},
      lastUpdated: new Date().toISOString()
    });

    console.log('Firestore reset complete');
  } catch (error) {
    console.error('Error resetting Firestore:', error);
  }
} 