"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/firebase";
import { generatePassphrase } from "@/utils/example_phrases";
import Link from "next/link";
import SignInVoiceAuth from "@/app/components/SignInVoiceAuth";
import PasswordInput from "@/app/components/PasswordInput";
import InputEmail from "@/app/components/InputEmail";
import OTPInput from "@/app/components/OTPInput"; // added import

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPopUp, setShowPopUp] = useState(false);
  const [voiceVerified, setVoiceVerified] = useState(false); // NEW state for voice verification

  const isValid = email.trim() !== "" && password !== "";

  useEffect(() => {
    setPassphrase(generatePassphrase());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      setUid(userCred.user.uid);
      setShowPopUp(true); // Show voice modal
    } catch (err: any) {
      setError(err.message);
    }
  };

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

  return (
    <main className="signup-page">
      <div className="signup-box">
        {!voiceVerified && (
          <form onSubmit={handleSubmit}>
            <h1>Sign In</h1>

            <InputEmail
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
              <button
                type="button"
                onClick={handlePasswordReset}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--col-primary)",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="signup-btn"
              style={{ marginTop: "1rem" }}
              disabled={!isValid}
            >
              Sign In
            </button>

            {error && <p className="error-text">{error}</p>}

            <div className="nav-links">
              <Link href="/sign-up">Sign Up</Link> |{" "}
              <Link href="/">Back to Home</Link>
            </div>
          </form>
        )}

        {/* OTP component after voice verification */}
        {voiceVerified && uid && (
          <OTPInput
            uid={uid}
            email={email}
            onSuccess={() => router.push("/dashboard")}
          />
        )}

        {/* Voice auth modal */}
        {showPopUp && uid && (
          <SignInVoiceAuth
            uid={uid}
            email={email}
            passphrase={passphrase}
            onClose={() => setShowPopUp(false)}
            onSuccess={() => {
              setVoiceVerified(true); // flag to trigger OTP step
              setShowPopUp(false);
            }}
            onFailure={() => {
              setError("Voice authentication failed.");
              setShowPopUp(false);
            }}
          />
        )}
      </div>
    </main>
  );
}
