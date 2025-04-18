"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase";
import VoiceAuth from "@/app/sign-in/VoiceAuth";
import { generatePassphrase } from "@/utils/example_phrases";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [voiceConfirmed, setVoiceConfirmed] = useState(false);

  useEffect(() => {
    setPassphrase(generatePassphrase());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      setUid(uid);
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
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ paddingRight: "2rem" }}
            />
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

            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "black",
              }}
            >
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {uid && (
          <VoiceAuth
            uid={uid}
            passphrase={passphrase}
            onConfirm={(confirmed) => setVoiceConfirmed(confirmed)}
          />
        )}
        <button type="submit">Sign In</button>

        <Link href="/sign-up" className="back-home-link">
          Sign Up
        </Link>
        <Link href="/" className="back-home-link">
          Back to Home
        </Link>
        {error && <p className="error-message">{error}</p>}
      </form>
    </main>
  );
}
