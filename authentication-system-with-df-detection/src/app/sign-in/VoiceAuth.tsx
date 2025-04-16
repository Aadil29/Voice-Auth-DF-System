"use client";
import { useState } from "react";

interface VoiceAuthProps {
  uid: string;
  passphrase: string;
  onConfirm: (confirmed: boolean) => void;
}

export default function VoiceAuth({
  uid,
  passphrase,
  onConfirm,
}: VoiceAuthProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "listening" | "confirmed" | "failed"
  >("idle");

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

        // FormData for both requests
        const formData = new FormData();
        formData.append("file", audioBlob, "sample.webm");
        formData.append("uid", uid);

        const dfFormData = new FormData();
        dfFormData.append("file", audioBlob, "sample.wav");

        let voiceMatch = false;
        let similarity = null;
        let isBonafide = false;

        try {
          // Voice embedding check
          const verifyRes = await fetch(
            "http://localhost:8000/verify-embedding/",
            {
              method: "POST",
              body: formData,
            }
          );
          const verifyResult = await verifyRes.json();
          similarity = verifyResult.similarity;

          voiceMatch = verifyResult.confirmed === true;

          // Deepfake check
          const dfRes = await fetch("http://localhost:8000/predict/", {
            method: "POST",
            body: dfFormData,
          });
          const dfResult = await dfRes.json();

          isBonafide = dfResult.prediction === "bonafide";

          // Combined logic
          if (voiceMatch && isBonafide) {
            setStatus("confirmed");
            setText(
              `Voice matched (similarity: ${similarity?.toFixed(2)}), and audio is bonafide.`
            );
            onConfirm(true);
          } else {
            setStatus("failed");

            const reasons = [];
            if (!voiceMatch)
              reasons.push(
                `Voice mismatch (similarity: ${similarity?.toFixed(2)})`
              );
            if (!isBonafide) reasons.push(`Deepfake detected`);

            setText(reasons.join(" | "));
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
          <button
            onClick={handleVoiceAuth}
            style={{ marginTop: "1rem" }}
            disabled={loading}
          >
            Try Again
          </button>
        </>
      )}

      {status === "confirmed" && (
        <p className="voice-auth-feedback success">{text}</p>
      )}
    </div>
  );
}
