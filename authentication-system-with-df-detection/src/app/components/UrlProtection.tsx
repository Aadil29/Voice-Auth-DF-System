/*
UrlProtection.tsx

This component acts as a route guard to prevent unauthenticated users
from accessing protected pages by manually typing the URL (e.g., /dashboard/deepfake).
Without this, users could bypass client-side navigation and access secure pagesjust by 
entering the path in the browser, which is a serious security risk.
It’s a simple but essential layer of protection to ensure that only logged-in users
can interact with sensitive parts of the site like the dashboard or voice systems.


*/

"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

interface UrlProtectionProps {
  children: ReactNode;
}

export default function UrlProtection({ children }: UrlProtectionProps) {
  const [loading, setLoading] = useState(true); // controls display while checking auth
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes on component mount
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Not logged in — redirect to sign-in page
        router.push("/sign-in");
      } else {
        // Logged in — stop loading and show protected content
        setLoading(false);
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [router]);

  // Show loading indicator while waiting for Firebase to respond
  if (loading) {
    return <p className="loading-message">Loading...</p>;
  }

  // If authenticated, render protected content
  return <>{children}</>;
}
