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
        const formData = new FormData();
        formData.append("file", audioBlob, "sample.webm");
        formData.append("uid", uid);

        try {
          // 1. Speaker verification
          const verifyRes = await fetch(
            "http://localhost:8000/verify-embedding/",
            {
              method: "POST",
              body: formData,
            }
          );
          const verifyData = await verifyRes.json();

          // 2. Deepfake prediction
          const dfFormData = new FormData();
          dfFormData.append("file", audioBlob, "sample.webm");

          const dfRes = await fetch(
            "http://localhost:8000/deepfake-auth-predict/",
            {
              method: "POST",
              body: dfFormData,
            }
          );
          const dfData = await dfRes.json();

          const spoofStatus = dfData.prediction === "spoof" ? "Fake" : "Real";
          const spoofConfidence = dfData.confidence?.toFixed(2) ?? "N/A";

          if (verifyData.confirmed && dfData.prediction === "bonafide") {
            setStatus("confirmed");
            setText(
              `Voice verified \nSimilarity: ${verifyData.similarity.toFixed(2)}\nDeepfake: ${spoofStatus} (confidence ${spoofConfidence})`
            );
            onConfirm(true);
          } else {
            setStatus("failed");
            setText(
              `Voice verification failed \nSimilarity: ${verifyData.similarity?.toFixed(2) ?? "N/A"}\nDeepfake: ${spoofStatus} (confidence ${spoofConfidence})`
            );
            onConfirm(false);
          }
        } catch (err) {
          setStatus("failed");
          setText("Server error during voice authentication.");
          onConfirm(false);
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 6000);
    } catch (error) {
      setText("Microphone access denied.");
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
          <pre className="voice-auth-feedback error">{text}</pre>
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
        <pre className="voice-auth-feedback success">{text}</pre>
      )}
    </div>
  );
}
