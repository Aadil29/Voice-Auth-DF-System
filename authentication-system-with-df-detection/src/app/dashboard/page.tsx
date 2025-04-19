/* 
  This is the landing page users see after signing in. It verifies that the user 
  is authenticated, and if not, redirects them to the sign-in page. Once authenticated, 
  it displays general information about the project and responsible use policies.
*/

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/app/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // Holds the current logged-in user
  const [loading, setLoading] = useState(true); // Indicates whether auth check is in progress

  useEffect(() => {
    // Listen for auth state changes. If no user is found, redirect to sign-in.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in"); // User is not logged in, redirect to sign-in page
      } else {
        setUser(currentUser); // Save the authenticated user
      }
      setLoading(false); // Hide loading once check is complete
    });

    return () => unsubscribe(); // Clean up the listener when component unmounts
  }, [router]);

  if (loading) {
    return <p>Loading...</p>; // Wait until auth check completes before showing the page
  }

  return (
    <>
      <Navbar />
      <main className="dashboard-content">
        <section className="info-box">
          <h2>What the Project Is About</h2>
          <p>
            Audio Shield is a voice authentication system with deepfake
            detection, providing a secure and modern way to verify identity and
            ensure integrity in audio-based systems.
          </p>
        </section>

        <section className="info-box">
          <h2>Privacy & Misuse</h2>
          <p>
            This system is intended strictly for ethical, educational, and
            informative purposes. You must not use this platform for any form of
            illegal activity, impersonation, or malicious intent. The deepfake
            detection feature is designed to raise awareness and support
            research into audio-based deception. It must not be used to evaluate
            or improve the effectiveness of deepfake attacks, nor to test
            adversarial audio in a way that supports or enables harmful
            behaviour. Any misuse of this platform may result in permanent
            suspension (account deletion) and could lead to legal consequences.
            Please use this tool responsibly and in accordance with all
            applicable laws and ethical standards.
          </p>
        </section>
      </main>
    </>
  );
}
