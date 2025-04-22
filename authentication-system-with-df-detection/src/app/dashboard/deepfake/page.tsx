/*

DeepfakeDetectionPage 

A protected page that allows authenticated users to upload `.wav` audio files
and receive deepfake detection results (bonafide or spoof). It sends the file to
a FastAPI backend(See Main.py), handles the prediction response, and logs results in Firebase Firestore.

Features:
- Upload form with .wav support
- Server-side prediction handling
- Upload history display per user
- Stats modal showing bonafide/spoof counts
- Route guarded with UrlProtection

*/

"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import UrlProtection from "@/app/components/UrlProtection";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { BiBarChartAlt2 } from "react-icons/bi";

interface UploadResult {
  filename: string;
  result: string;
  timestamp: number;
}

export default function DeepfakeDetectionPage() {
  const [file, setFile] = useState<File | null>(null); // Holds the selected .wav file
  const [result, setResult] = useState<string>(""); // Stores the prediction result
  const [loading, setLoading] = useState(false); // Controls the submit button/loading state
  const [history, setHistory] = useState<UploadResult[]>([]); // List of user's past uploads
  const [showStats, setShowStats] = useState(false); // Toggles the stats popup

  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch history when the user becomes available (auth state loaded)
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      const q = query(
        collection(db, "deepfakeHistory"),
        where("uid", "==", user.uid)
      );
      const snap = await getDocs(q);

      const data = snap.docs
        .map((doc) => doc.data() as UploadResult)
        .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

      setHistory(data);
    };

    fetchHistory();
  }, [user]);

  // Handles file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sel = e.target.files?.[0] ?? null;
    setFile(sel);
    setResult(""); // Clear old result when a new file is selected
  };

  // Sends the selected file to the FastAPI server and handles the result
  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });

      // Handle rate-limiting or general server errors
      if (!res.ok) {
        if (res.status === 429) {
          alert(
            "You’re sending requests too quickly—please wait and try again."
          );
        } else {
          const text = await res.text();
          alert(`Server error (${res.status}): ${text}`);
        }
        setLoading(false);
        return;
      }

      // Parse prediction result from server
      const data = await res.json();
      const label = (data.prediction || "UNKNOWN").toUpperCase();
      setResult(label);

      // Save result in Firestore for history
      if (user) {
        const now = Date.now();
        await addDoc(collection(db, "deepfakeHistory"), {
          uid: user.uid,
          filename: file.name,
          result: label,
          timestamp: now,
        });
        // Add to history UI immediately
        setHistory((prev) => [
          { filename: file.name, result: label, timestamp: now },
          ...prev,
        ]);
      }
    } catch (err) {
      // Likely network/server crash issue
      alert("Failed to connect to server: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Basic stats from history
  const totalUploads = history.length;
  const bonafideCount = history.filter((item) =>
    item.result.includes("BONAFIDE")
  ).length;
  const spoofCount = history.filter((item) =>
    item.result.includes("SPOOF")
  ).length;

  return (
    <UrlProtection>
      <Navbar />

      {/* Stats popup overlay */}
      {showStats && (
        <div className="stats-backdrop">
          <div className="stats-content">
            <button className="stats-close" onClick={() => setShowStats(false)}>
              &times;
            </button>
            <h2 style={{ marginBottom: "1rem" }}>
              Deepfake Detection Statistics
            </h2>
            <div className="stats-boxes">
              <div className="info-box">
                <strong>Total Uploads:</strong> {totalUploads}
                {/* total uploads for that user  */}
              </div>
              <div className="info-box bonafide">
                <strong>Bonafide:</strong> {bonafideCount}
                {/* total number of "real" audios detected */}
              </div>
              <div className="info-box spoof">
                <strong>Spoof:</strong> {spoofCount}
                {/* total number of "deepfake" audios detected */}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="deepfake-detection-page">
        {/* infomation describing the page and what it can be used for */}
        <section className="intro-section">
          <h1 className="page-title">Audio Deepfake Detection</h1>
          <p className="description">
            Upload a <strong>.WAV</strong> file to detect if it’s AI‑generated
            (spoof) or real.
          </p>
          <p className="disclaimer">
            For educational use only. See privacy and misuse for further
            details. May not match real‑world legal standards.
          </p>
        </section>

        {/* Floating stats button */}
        <button
          onClick={() => setShowStats(true)}
          className="stats-toggle-button"
          title="View Stats"
        >
          <BiBarChartAlt2 />
        </button>

        {/* upload .wav file section */}
        <section className="upload-section">
          <div className="upload-controls">
            <label className="file-upload">
              <input type="file" accept=".wav" onChange={handleFileChange} />
              <span className="file-name">
                {file ? file.name : "Choose .wav file"}
              </span>
            </label>

            {/* Preview + result text */}
            {file && (
              <div className="audio-preview" style={{ margin: "1rem 0" }}>
                <strong>{file.name}</strong>
                <audio controls src={URL.createObjectURL(file)} />
                {result && (
                  <p
                    className={`result-text ${
                      result.includes("BONAFIDE") ? "bonafide" : "spoof"
                    }`}
                  >
                    {result}
                  </p>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className={`detect-button ${loading ? "loading" : ""}`}
            >
              {loading ? "Processing..." : "Detect Deepfake"}
            </button>
          </div>
        </section>
      </main>
    </UrlProtection>
  );
}
