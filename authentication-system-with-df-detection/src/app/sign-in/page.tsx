/* 
  This page handles user login using email and password. 
  After verifying credentials with Firebase, the user is prompted with voice authentication.
  If the voice is verified successfully, the user is redirected to the dashboard.
  The page also supports password reset and toggling password visibility.
*/

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/firebase";
import VoiceAuth from "@/app/sign-in/VoiceAuth";
import { generatePassphrase } from "@/utils/example_phrases";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState(""); // User input: email
  const [password, setPassword] = useState(""); // User input: password
  const [uid, setUid] = useState<string | null>(null); // Set after successful email/password sign-in
  const [show, setShow] = useState(false); // Controls password visibility toggle
  const [error, setError] = useState(""); // Displays error or success messages
  const [passphrase, setPassphrase] = useState(""); // Voice passphrase to read
  const [voiceConfirmed, setVoiceConfirmed] = useState(false); // True after voice match is confirmed

  useEffect(() => {
    setPassphrase(generatePassphrase()); // Create a random voice phrase when the page loads
  }, []);

  // Triggered when the user submits their email and password
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      setUid(uid); // Only move forward to voice auth after successful email/password check
    } catch (err: any) {
      setError(err.message); // Firebase will return user-friendly messages
    }
  };

  // Triggered when the "Forgot password?" link is clicked
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Redirect to dashboard once voice is verified
  useEffect(() => {
    if (voiceConfirmed) {
      router.push("/dashboard");
    }
  }, [voiceConfirmed, router]);

  return (
    <main className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Sign In</h1>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={show ? "text" : "password"} // Toggle between plain and hidden text
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ paddingRight: "2rem" }}
            />

            {/* Password reset link appears inside the field area */}
            <p style={{ textAlign: "right", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={handlePasswordReset}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0e508d",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Forgot password?
              </button>
            </p>
          </div>
        </div>

        {/* Only show voice auth if email/password sign-in succeeds */}
        {uid && (
          <VoiceAuth
            uid={uid}
            passphrase={passphrase}
            onConfirm={(confirmed) => setVoiceConfirmed(confirmed)}
          />
        )}

        <button type="submit">Sign In</button>

        {/* Navigation links for users who want to sign up or return to homepage */}
        <Link href="/sign-up" className="back-home-link">
          Sign Up
        </Link>
        <Link href="/" className="back-home-link">
          Back to Home
        </Link>

        {/* Display error or reset message */}
        {error && <p className="error-message">{error}</p>}
      </form>
    </main>
  );
}
