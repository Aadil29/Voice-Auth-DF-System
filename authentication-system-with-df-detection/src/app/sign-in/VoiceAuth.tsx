"use client";
import { useState } from "react";

interface VoiceAuthProps {
  passphrase: string;
  onConfirm: (confirmed: boolean) => void;
}

export default function VoiceAuth({ passphrase, onConfirm }: VoiceAuthProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "listening" | "confirmed" | "failed">("idle");

  const handleVoiceAuth = async () => {
    setLoading(true);
    setText("");
    setStatus("listening");

    try {
      const res = await fetch(`http://localhost:8000/listen?passphrase=${encodeURIComponent(passphrase)}`);
      const data = await res.json();

      if (data.error) {
        setText(data.error);
        setStatus("failed");
        onConfirm(false);
      } else if (data.confirmed) {
        setText(`Confirmed! You said: "${data.text}"`);
        setStatus("confirmed");
        onConfirm(true);
      } else {
        setText(`Passphrase not recognised. You said: "${data.text}"`);
        setStatus("failed");
        onConfirm(false);
      }
    } catch (error) {
      setText("Failed to connect to server.");
      setStatus("failed");
      onConfirm(false);
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Please say this phrase clearly:</h3>
      <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{passphrase}</p>

      {status === "idle" && (
        <button onClick={handleVoiceAuth} disabled={loading}>
          Start Voice Authentication
        </button>
      )}

      {status === "listening" && (
        <button disabled>Listening... (10 seconds)</button>
      )}

      {status === "failed" && (
        <>
          <p style={{ color: "red" }}>{text}</p>
          <button onClick={handleVoiceAuth} style={{ marginTop: "1rem" }}>
            Try Again
          </button>
        </>
      )}

      {status === "confirmed" && <p style={{ color: "green" }}>{text}</p>}
    </div>
  );
}
