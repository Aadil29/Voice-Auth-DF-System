/* 
  This component handles client-side voice authentication.
  It records the user's voice for 6 seconds, sends it to the backend for:
  1. Speaker verification (embedding similarity against registered voice),
  2. Deepfake detection (checks if the voice is synthetic).
  
  If both checks pass, the user is confirmed and redirected by the parent.
*/

"use client";

import { useState } from "react";

interface VoiceAuthProps {
  uid: string; // User ID used to retrieve their stored voice embedding
  passphrase: string; // Random passphrase the user must read aloud
  onConfirm: (confirmed: boolean) => void; // Callback to inform parent whether auth was successful
}

export default function VoiceAuth({
  uid,
  passphrase,
  onConfirm,
}: VoiceAuthProps) {
  const [text, setText] = useState(""); // Text to show result or errors
  const [loading, setLoading] = useState(false); // Controls button loading state
  const [status, setStatus] = useState<
    "idle" | "listening" | "confirmed" | "failed"
  >("idle");

  const handleVoiceAuth = async () => {
    setLoading(true);
    setStatus("listening");

    try {
      // Request access to user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      // Store chunks as they become available
      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        // FormData for speaker verification
        const formData = new FormData();
        formData.append("file", audioBlob, "sample.webm");
        formData.append("uid", uid);

        try {
          // Send to speaker verification API
          const verifyRes = await fetch(
            "http://localhost:8000/verify-embedding/",
            {
              method: "POST",
              body: formData,
            }
          );
          const verifyData = await verifyRes.json();

          // Send to deepfake detection API
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

          // Success: both speaker match and bonafide (not spoofed)
          if (verifyData.confirmed && dfData.prediction === "bonafide") {
            setStatus("confirmed");
            setText(
              `Voice verified \nSimilarity: ${verifyData.similarity.toFixed(2)}\nDeepfake: ${spoofStatus} (confidence ${spoofConfidence})`
            );
            onConfirm(true);
          } else {
            // One or both checks failed
            setStatus("failed");
            setText(
              `Voice verification failed \nSimilarity: ${verifyData.similarity?.toFixed(2) ?? "N/A"}\nDeepfake: ${spoofStatus} (confidence ${spoofConfidence})`
            );
            onConfirm(false);
          }
        } catch (err) {
          // Server call failed
          setStatus("failed");
          setText("Server error during voice authentication.");
          onConfirm(false);
        } finally {
          setLoading(false);
        }
      };

      // Start recording, stop automatically after 6 seconds
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 6000);
    } catch (error) {
      // User denied microphone or another failure
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
