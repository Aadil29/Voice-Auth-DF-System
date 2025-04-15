"use client";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";

interface Props {
  email: string;
}

export default function OTPInputComponent({ email }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleVerify = async () => {
    setError("");

    try {
      const ref = doc(db, "emailVerifications", email);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setError("No verification record found.");
        return;
      }

      const data = snap.data();
      const createdAt = data.createdAt?.toDate?.();
      const expires = createdAt ? createdAt.getTime() + 10 * 60 * 1000 : 0;

      if (Date.now() > expires) {
        setError("Code expired. Please sign up again.");
        return;
      }

      if (data.code !== code) {
        setError("Incorrect code.");
        return;
      }

      router.push("/sign-in");
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>Enter the code sent to your email</h2>
      <input
        type="text"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
