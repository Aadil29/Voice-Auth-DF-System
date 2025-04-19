/* 
  This page handles user registration using email, password, and voice.
  Steps include:
  - Email/password account creation (Firebase Auth)
  - Voice recording for speaker embedding (sent to backend for feature extraction)
  - OTP email verification using Brevo API
  - Account is only considered valid once both voice and OTP verification pass
*/

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false); // Toggle for password visibility
  const [error, setError] = useState("");

  // Voice registration state
  const [showVoiceReg, setShowVoiceReg] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  // OTP verification
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userUID, setUserUID] = useState<string | null>(null);

  const voicePrompt =
    "Please say the following in a conversational tone: ''' My name is [say full name], and Audio Shield secures and protects your voice.''' ";

  // Send voice to backend to extract speaker embedding
  const getSpeakerEmbedding = async (
    audioBlob: Blob
  ): Promise<number[] | null> => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice_sample.wav");

      const res = await fetch("http://localhost:8000/extract-embedding/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.embedding) {
        return data.embedding;
      } else {
        console.error("Failed to extract embedding:", data.error);
        return null;
      }
    } catch (err) {
      console.error("Embedding extraction failed:", err);
      return null;
    }
  };

  // Handles full registration process
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (!audioBlob) return setError("Please record your voice.");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      setUserUID(uid);

      const embedding = await getSpeakerEmbedding(audioBlob);
      if (!embedding)
        return setError("Failed to process voice. Please try again.");

      // Save voice embedding
      await setDoc(doc(db, "voiceEmbeddings", uid), {
        embedding,
        createdAt: serverTimestamp(),
      });

      // Generate and store OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await setDoc(doc(db, "emailVerifications", uid), {
        code,
        email,
        createdAt: serverTimestamp(),
      });

      // Send OTP via email
      await fetch("/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Verifies the OTP entered by the user
  const verifyCode = async () => {
    if (!userUID) return setError("User ID not found.");

    try {
      const ref = doc(db, "emailVerifications", userUID);
      const snap = await getDoc(ref);

      if (!snap.exists()) return setError("No record found.");

      const data = snap.data();
      const createdAt = data.createdAt?.toDate?.();
      const expires = createdAt ? createdAt.getTime() + 10 * 60 * 1000 : 0;

      if (Date.now() > expires)
        return setError("Code expired. Please sign up again.");
      if (data.code !== otpCode) return setError("Incorrect code.");

      router.push("/sign-in");
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  // Records 6 seconds of audio using MediaRecorder API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob)); // For playback preview
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);

      setTimeout(() => {
        recorder.stop();
        setRecording(false);
      }, 6000);
    } catch (err) {
      setError("Microphone access is required.");
    }
  };

  // Allows user to discard recording and start over
  const reRecord = () => {
    setAudioBlob(null);
    setAudioURL(null);
    startRecording();
  };

  return (
    <main className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h1>Sign Up</h1>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          </div>
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

        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Show voice registration only when form is valid */}
        {!showVoiceReg &&
          email &&
          password &&
          confirmPassword &&
          password === confirmPassword && (
            <button type="button" onClick={() => setShowVoiceReg(true)}>
              Continue to Voice Registration
            </button>
          )}

        {/* Record and preview voice sample */}
        {showVoiceReg && !otpSent && (
          <div className="voice-registration">
            <p>{voicePrompt}</p>

            {!audioBlob && (
              <button
                type="button"
                onClick={startRecording}
                disabled={recording}
              >
                {recording ? "Recording..." : "Record Voice"}
              </button>
            )}

            {audioBlob && (
              <>
                <audio controls src={audioURL || ""}></audio>
                <div style={{ marginTop: "0.5rem" }}>
                  <button type="button" onClick={reRecord}>
                    Re-record
                  </button>
                  <button type="submit">Sign Up</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* OTP confirmation input */}
        {otpSent && (
          <div className="otp-section">
            <h4>Enter the 6-digit code sent to {email}</h4>
            <input
              type="text"
              placeholder="Verification Code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
            <button type="button" onClick={verifyCode}>
              Verify
            </button>
          </div>
        )}

        <Link href="/sign-in" className="back-home-link">
          Sign In
        </Link>
        <Link href="/" className="back-home-link">
          Back to Home
        </Link>

        {error && <p className="error-message">{error}</p>}
      </form>
    </main>
  );
}
