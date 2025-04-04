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
    <main>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit} style={{ display: "inline-block" }}>
        <div>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>

        <div style={{ marginTop: "0.5rem" }}>
          <label htmlFor="password">Password</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>

        <button type="submit" style={{ marginTop: "1rem" }}>
          Sign In
        </button>
      </form>

      <VoiceAuth
        passphrase={passphrase}
        onConfirm={(status: boolean) => setVoiceConfirmed(status)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
