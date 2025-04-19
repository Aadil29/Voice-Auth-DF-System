/* 
  This is the landing page of the Audio Shield application.
  It introduces the app and provides links for users to sign in or sign up.
  There's also a personal credit section at the bottom.
*/

"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="homepage">
      <h1>Audio Shield</h1>
      <h4>
        Secure voice authentication system, with real-time audio deepfake
        detection.
      </h4>

      {/* Sign In / Sign Up links */}
      <div className="auth-box">
        <Link href="/sign-in" className="auth-link">
          Sign In
        </Link>
        <Link href="/sign-up" className="auth-link">
          Sign Up
        </Link>
      </div>

      {/* Credit section */}
      <div className="creds">
        <h4>Made By Muhammad Aadil Ghani</h4>
      </div>
    </main>
  );
}
