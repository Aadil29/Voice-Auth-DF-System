/* 
  This is the landing page of the Audio Shield application.
  It introduces the app and provides links for users to sign in or sign up.
  There's also a personal credit section at the bottom.
*/

"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="homepage">
      <div className="hero">
        <h1 className="hero-title">Audio Shield</h1>
        <p className="hero-subtitle">
          A secure voice authentication platform powered by real-time audio
          deepfake detection.
        </p>

        <div className="hero-image">
          <Image
            src="/images/voiceAuth.png"
            alt="Voice Authentication Illustration"
            width={320}
            height={320}
          />
        </div>

        <div className="hero-buttons">
          <Link href="/sign-in" className="auth-link primary">
            Sign In
          </Link>
          <Link href="/sign-up" className="auth-link secondary">
            Sign Up
          </Link>
        </div>
      </div>

      <footer className="homepage-footer">
        <p>
          Created by Muhammad Aadil Ghani - Final Year Computer Science With
          Cyber Security Project.
        </p>
      </footer>
    </main>
  );
}
