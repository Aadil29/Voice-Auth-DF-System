"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const [showVoiceReg, setShowVoiceReg] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userUID, setUserUID] = useState<string | null>(null);

  const voicePrompt =
    "Please say the following in a conversatioanl tone: 'My name is [say name], and Audio Shield secure's and protect's your voice.'";

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

      await setDoc(doc(db, "voiceEmbeddings", uid), {
        embedding,
        createdAt: serverTimestamp(),
      });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await setDoc(doc(db, "emailVerifications", uid), {
        code,
        email,
        createdAt: serverTimestamp(),
      });

      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
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

        {!showVoiceReg &&
          email &&
          password &&
          confirmPassword &&
          password === confirmPassword && (
            <button type="button" onClick={() => setShowVoiceReg(true)}>
              Continue to Voice Registration
            </button>
          )}

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

        {otpSent && (
          <div className="otp-section">
            <h2>Enter the 6-digit code sent to {email}</h2>
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

        <span
          style={{
            color: "#0e508d",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => router.push("/sign-in")}
        >
          Sign In
        </span>

        {error && <p className="error-message">{error}</p>}
      </form>
    </main>
  );
}
