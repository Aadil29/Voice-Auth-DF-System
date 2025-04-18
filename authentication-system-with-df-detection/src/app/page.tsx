"use client";
import Link from "next/link";
export default function HomePage() {
  return (
    <main className="homepage">
      <h1>Audio Shield</h1>
      <h4>
        Secure voice authentication system, with audio deepfake detection.
      </h4>

      <div className="auth-box">
        <Link href="/sign-in" className="auth-link">
          Sign In
        </Link>
        <Link href="/sign-up" className="auth-link">
          Sign Up
        </Link>
      </div>

      <div className="creds">
        <h4>Made By Muhammad Aadil Ghani</h4>
      </div>
    </main>
  );
}
