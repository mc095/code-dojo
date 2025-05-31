"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/");
      }
    });
    // Sign out on tab/browser close
    const handleUnload = () => signOut(auth);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [router]);

  const handleSignIn = async () => {
    await signInWithPopup(auth, provider);
    router.replace("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-card p-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-xl w-full">
        <h1 className="text-4xl font-extrabold mb-4 text-center">Welcome to DSA Tracker</h1>
        <p className="mb-8 text-lg text-muted-foreground text-center max-w-md">Track your daily DSA progress, compete with friends, and visualize your journey. Sign in to get started!</p>
        <button
          onClick={handleSignIn}
          className="bg-primary text-primary-foreground px-10 py-4 rounded-lg font-bold text-xl shadow-lg hover:bg-primary/80 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
} 