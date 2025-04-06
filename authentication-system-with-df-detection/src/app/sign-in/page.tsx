"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import VoiceAuth from "@/app/sign-in/VoiceAuth";
import { generatePassphrase } from "@/utils/example_phrases";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [voiceConfirmed, setVoiceConfirmed] = useState(false);

  useEffect(() => {
    setPassphrase(generatePassphrase());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!voiceConfirmed) {
      setError("Voice authentication is required.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

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
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </div>
  
      {/* Voice Auth Section Inside Form */}
      <div className="voice-auth">
        <p>Please say this phrase clearly:</p>
        <div className="passphrase-box">{passphrase}</div>
        <br />
        <button type="button" onClick={() => setVoiceConfirmed(true)}>
          Start Voice Authentication
        </button>
      </div>
  
      <button type="submit">Sign In</button>
  
      {error && <p className="error-message">{error}</p>}
    </form>
  </main>
  
  );
}
