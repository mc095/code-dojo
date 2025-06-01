"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export default function LandingPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/");
      }
    });
    // Sign out on tab/browser close
    const handleUnload = (): void => {
      signOut(auth);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [router]);

  const handleSignIn = (): void => {
    signInWithPopup(auth, provider).then(() => {
      router.replace("/");
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="max-w-4xl w-full text-center space-y-8">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-sm font-medium text-gray-300">✨ Track your coding journey</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Solve &nbsp;
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                   DSA &nbsp;
                </span>
                with your friend!
                </span>
                <br />
                
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Track your daily DSA progress, compete with your friends, your self hosted platform
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <button
                onClick={handleSignIn}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-black bg-white rounded-full transition-all duration-300 hover:bg-gray-100 hover:scale-105 hover:shadow-2xl hover:shadow-white/25"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </span>
                
                {/* Button glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}