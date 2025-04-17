"use client";
import Link from "next/link";
export default function HomePage() {
  return (
    <main className="homepage">
      <h1>Audio Shield</h1>
      <h2>
        Secure voice authentication system, with audio deepfake detection.
      </h2>
      <h3>Made by Muhammad Aadil Ghani</h3>
      <p>Please sign in or sign up to continue.</p>

      <div className="auth-box">
        <Link href="/sign-in" className="auth-link">
          Sign In
        </Link>
        <Link href="/sign-up" className="auth-link">
          Sign Up
        </Link>
      </div>
    </main>
  );
}
