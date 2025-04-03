"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <main>
      <h1>Welcome to Our Application</h1>
      <p>Please sign in or sign up to continue.</p>
      <p>
        <Link href="/sign-in">Sign In</Link> | <Link href="/sign-up">Sign Up</Link>
      </p>
    </main>
  );
}
