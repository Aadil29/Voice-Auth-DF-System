/*

SignInVoiceAuth.tsx

 Component used during sign-in to authenticate users via voice.It captures 
 an audio sample from the microphone, then:
   1. Transcribes it using Whisper and checks if the passphrase was spoken.
   2. Verifies the speaker identity using a stored voice embedding.
   3. Runs a deepfake detection model to ensure the audio is genuine.

These 3 api implementations can be found in Main.py
Only if all three checks pass does it call `onSuccess`. Otherwise, it triggers `onFailure`.
Designed to be used in the sign-in flow after email/password is validated.


*/

// Marking this file as a Client Component in Next.js
"use client";

import { useRef, useState } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa"; // Importing icons for UI feedback
import RecordingCountdown from "@/app/components/RecordingCountdown"; // Countdown component for recording
import { setDoc, doc, serverTimestamp } from "firebase/firestore"; // Firebase functions to write verification info
import { db } from "@/firebase"; // Firebase DB instance

// Define the props expected by the component
interface SignInVoiceAuthProps {
  uid: string;
  email: string;
  passphrase: string;
  onClose: () => void;
  onSuccess: () => void;
  onFailure: () => void;
}

// Voice authentication component for sign-in flow
export default function SignInVoiceAuth({
  uid,
  email,
  passphrase,
  onClose,
  onSuccess,
  onFailure,
}: SignInVoiceAuthProps) {
  // State hooks to track loading and different stages
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "listening" | "transcribing" | "done"
  >("idle");

  const [transcript, setTranscript] = useState<string>(""); // Transcription result
  const [passphraseMatch, setPassphraseMatch] = useState<boolean>(false); // Whether passphrase was correctly said
  const [verifyConfirmed, setVerifyConfirmed] = useState<boolean>(false); // Whether speaker verification succeeded
  const [similarity, setSimilarity] = useState<string>("N/A"); // Cosine similarity score from backend
  const [isSpoof, setIsSpoof] = useState<boolean>(false); // Whether audio is predicted as deepfake
  const [passed, setPassed] = useState<boolean | null>(null); // Overall pass/fail status

  const audioChunks = useRef<Blob[]>([]); // Holds the recorded audio chunks

  // Main voice authentication handler
  const handleVoiceAuth = async () => {
    setLoading(true);
    setStatus("listening");

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      // Save chunks of audio as they become available
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      // When recording stops, proceed to analysis
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop()); // Stop all audio tracks
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setStatus("transcribing");

        // STEP 1: Transcribe audio using Whisper
        const whisperForm = new FormData();
        whisperForm.append("file", blob, "sample.webm");

        const whisperRes = await fetch(
          `http://localhost:8000/listen/?passphrase=${encodeURIComponent(passphrase)}`,
          { method: "POST", body: whisperForm }
        );
        const whisperData = await whisperRes.json();

        setTranscript(whisperData.text || "(No transcription)");
        setPassphraseMatch(!!whisperData.confirmed); // Whether transcription matched the required passphrase

        // Prepare form data for backend verification and deepfake check
        const formData = new FormData();
        formData.append("file", blob, "sample.webm");
        formData.append("uid", uid);

        // Send audio to both endpoints simultaneously
        const [verifyRes, dfRes] = await Promise.all([
          fetch("http://localhost:8000/verify-embedding/", {
            method: "POST",
            body: formData,
          }),
          fetch("http://localhost:8000/deepfake-auth-predict/", {
            method: "POST",
            body: formData,
          }),
        ]);

        const verifyData = await verifyRes.json();
        const dfData = await dfRes.json();

        // Update results from backend
        setSimilarity(verifyData.similarity?.toFixed(2) ?? "N/A");
        setVerifyConfirmed(!!verifyData.confirmed);
        const spoof = dfData.prediction === "spoof";
        setIsSpoof(spoof);

        // Final check: all three systems (Whisper, verification, deepfake detection) must pass
        const didPass =
          verifyData.confirmed === true &&
          dfData.prediction === "bonafide" &&
          !!whisperData.confirmed;

        setPassed(didPass);
        setStatus("done");
        setLoading(false);
      };

      // Start recording
      recorder.start();
      // Automatically stop recording after 6 seconds
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 6000);
    } catch {
      // If any error occurs, fail safely and update states
      setTranscript("");
      setPassphraseMatch(false);
      setVerifyConfirmed(false);
      setSimilarity("N/A");
      setIsSpoof(false);
      setPassed(false);
      setStatus("done");
      setLoading(false);
    }
  };

  // If voice auth passed, send OTP to user's email and proceed
  const handleFinalSuccess = async () => {
    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Save OTP and email to Firestore
      await setDoc(doc(db, "emailVerifications", uid), {
        code,
        email,
        createdAt: serverTimestamp(),
      });

      // Send OTP via backend email service
      await fetch("/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      // Notify parent that user passed authentication
      onSuccess();
    } catch (err) {
      console.error("Failed to send OTP:", err);
      onFailure();
    }
  };

  // UI rendering
  return (
    <div className="voice-model-backdrop">
      <div className="voice-model">
        <button className="close-model" onClick={onClose}>
          ×
        </button>

        <h2>Voice Authentication</h2>
        <p className="voice-prompt">Please say this phrase clearly:</p>
        <div className="passphrase-box">{passphrase}</div>

        {/* Show "Start Recording" when idle */}
        {status === "idle" && (
          <button
            onClick={handleVoiceAuth}
            className="start-auth-btn"
            disabled={loading}
          >
            <FaMicrophone /> Start Recording
          </button>
        )}

        {/* Show recording UI while recording */}
        {status === "listening" && (
          <button disabled className="start-auth-btn loading">
            <FaMicrophoneSlash /> Recording…{" "}
            <RecordingCountdown duration={6} active={status === "listening"} />
          </button>
        )}

        {/* Show transcribing status */}
        {status === "transcribing" && (
          <button disabled className="start-auth-btn loading">
            <FaSpinner className="spin" /> Transcribing…
          </button>
        )}

        {/* Show results once done */}
        {status === "done" && (
          <div className="voice-auth-feedback" style={{ marginTop: "1rem" }}>
            <p>Transcribed: “{transcript}”</p>

            <p>
              Passphrase Match:{" "}
              {passphraseMatch ? <FaCheckCircle /> : <FaTimesCircle />}
            </p>

            <p>
              Similarity: {similarity}{" "}
              {verifyConfirmed ? <FaCheckCircle /> : <FaTimesCircle />}
            </p>

            <p>
              Is Deepfake?{" "}
              {isSpoof ? (
                <>
                  <FaCheckCircle /> Yes
                </>
              ) : (
                <>
                  <FaTimesCircle /> No
                </>
              )}
            </p>

            {/* Based on pass/fail, show Proceed or Try Again */}
            <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
              {passed ? (
                <button className="start-auth-btn" onClick={handleFinalSuccess}>
                  <FaCheckCircle /> Proceed
                </button>
              ) : (
                <button
                  className="start-auth-btn"
                  onClick={() => {
                    setStatus("idle");
                    onFailure();
                  }}
                >
                  <FaTimesCircle /> Try Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
