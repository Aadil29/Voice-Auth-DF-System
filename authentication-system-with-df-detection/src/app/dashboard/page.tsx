"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/app/components/Navbar";


export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
     <>
      <Navbar />
        <main className="dashboard-content">
          <section className="info-box">
            <h2>What the Project Is About</h2>
            <p>
              Audio Shield is a voice authentication system with deepfake detection,
              providing a secure and modern way to verify identity and ensure
              integrity in audio-based systems.
            </p>
          </section>
  
          <section className="info-box">
            <h2>Privacy & Misuse</h2>
            <p>
              This system is strictly for ethical and legitimate use only.
              Do not use this platform for illegal activity or impersonation.
              Violators may face permanent suspension and legal consequences.
            </p>
          </section>
        </main>
      </>
    );
}