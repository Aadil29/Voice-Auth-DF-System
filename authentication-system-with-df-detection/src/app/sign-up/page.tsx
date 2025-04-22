/*
SignUpPage Component

This page handles full user registration with three layers of verification:
1. Email & password (Firebase Auth)
2. Voice biometric registration (records 3 samples → generates an averaged embedding)
3. OTP verification sent to the user's email (via a custom backend + Firestore)

The form enables submission only after valid inputs and successful voice registration.
*/

"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import VoiceModel from "@/app/components/SignUpVoiceAuth";
import PasswordInput from "@/app/components/PasswordInput";
import EmailInput from "@/app/components/InputEmail";
import OTPInput from "@/app/components/OTPInput";

export default function SignUpPage() {
  const router = useRouter();

  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false); // only show confirm input after typing in password

  // Voice modal state
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceRegistered, setVoiceRegistered] = useState(false);
  const [avgEmbedding, setAvgEmbedding] = useState<number[] | null>(null); // final voice vector

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [userUID, setUserUID] = useState<string | null>(null);

  // Error messages
  const [error, setError] = useState("");

  useEffect(() => {
    setShowConfirm(password.length > 0);
  }, [password]);

  const isValid =
    email.trim() !== "" &&
    password !== "" &&
    confirmPassword !== "" &&
    avgEmbedding !== null;

  const handleVoiceComplete = (avgEmb: number[]) => {
    setAvgEmbedding(avgEmb);
    setVoiceRegistered(true);
    setShowVoiceModal(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!avgEmbedding) {
      setError("Please record your voice.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      setUserUID(uid);

      await setDoc(doc(db, "voiceEmbeddings", uid), {
        embedding: avgEmbedding,
        createdAt: serverTimestamp(),
      });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await setDoc(doc(db, "emailVerifications", uid), {
        code,
        email,
        createdAt: serverTimestamp(),
      });

      await fetch("/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-box">
        <h1>Sign Up</h1>

        <EmailInput value={email} onChange={(e) => setEmail(e.target.value)} />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />

        {showConfirm && (
          <>
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Secure Password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="error-text">Passwords do not match.</p>
            )}
          </>
        )}

        <div className="voice-status">
          <span>Voice Registration:</span>
          {voiceRegistered ? (
            <span className="done">Completed</span>
          ) : (
            <button onClick={() => setShowVoiceModal(true)}>Begin</button>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        {!otpSent && (
          <button
            className="signup-btn"
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Sign Up
          </button>
        )}

        {otpSent && userUID && (
          <OTPInput
            uid={userUID}
            email={email}
            onSuccess={() => router.push("/sign-in")}
          />
        )}

        <div className="nav-links">
          <Link href="/sign-in">Sign In</Link> |{" "}
          <Link href="/">Back to Home</Link>
        </div>
      </div>

      {showVoiceModal && (
        <VoiceModel
          onClose={() => setShowVoiceModal(false)}
          onComplete={handleVoiceComplete}
        />
      )}
    </main>
  );
}
