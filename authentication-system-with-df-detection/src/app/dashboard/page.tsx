"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";

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

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/sign-in");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>Dashboard</h1>
      {user ? (
        <>
          <p>Welcome, {user.email}!</p>
          <button onClick={handleSignOut}>Log Out</button>
        </>
      ) : (
        <p>Not authenticated.</p>
      )}
    </main>
  );
}
