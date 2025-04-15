"use client";
import { useState } from "react";

interface VoiceAuthProps {
  uid: string;
  passphrase: string;
  onConfirm: (confirmed: boolean) => void;
}

export default function VoiceAuth({ uid, passphrase, onConfirm }: VoiceAuthProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "listening" | "confirmed" | "failed">("idle");

  const handleVoiceAuth = async () => {
    setLoading(true);
    setStatus("listening");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "sample.webm");
        formData.append("uid", uid);

        try {
          const res = await fetch("http://localhost:8000/verify-embedding/", {
            method: "POST",
            body: formData,
          });

          const result = await res.json();

          if (result.confirmed) {
            setStatus("confirmed");
            setText(`Voice confirmed! Similarity: ${result.similarity.toFixed(2)}`);
            onConfirm(true);
          } else {
            setStatus("failed");
            setText(`Voice mismatch. Similarity: ${result.similarity?.toFixed(2) || "N/A"}`);
            onConfirm(false);
          }
        } catch (err) {
          setStatus("failed");
          setText("Server error during verification.");
          onConfirm(false);
        } finally {
          setLoading(false); 
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000);
    } catch (error) {
      setText("Microphone access failed.");
      setStatus("failed");
      onConfirm(false);
      setLoading(false); 
    }
  };

  return (
    <div className="voice-auth">
      <h3>Please say this phrase clearly:</h3>
      <p className="passphrase-box">{passphrase}</p>

      {status === "idle" && (
        <button onClick={handleVoiceAuth} disabled={loading}>
          Start Voice Authentication
        </button>
      )}

      {status === "listening" && <button disabled>Listening...</button>}

      {status === "failed" && (
        <>
          <p className="voice-auth-feedback error">{text}</p>
          <button onClick={handleVoiceAuth} style={{ marginTop: "1rem" }} disabled={loading}>
            Try Again
          </button>
        </>
      )}

      {status === "confirmed" && <p className="voice-auth-feedback success">{text}</p>}
    </div>
  );
}

