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
      <h1>Audio Shield</h1>
      <h2>Secure voice authentication system, with audio deepfake detction.</h2>
      <h3>Made by Muhammad Aadil Ghani</h3>
      <p>Please sign in or sign up to continue.</p>
      <p>
        <Link href="/sign-in">Sign In</Link> | <Link href="/sign-up">Sign Up</Link>
      </p>
    </main>
  );
}
