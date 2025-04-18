"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";

export default function DeepfakeDetectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        setResult("Error: " + data.error);
      } else {
        setResult(
          `Prediction: ${data.prediction.toUpperCase()} (Confidence: ${(
            data.confidence * 100
          ).toFixed(2)}%)`
        );
      }
    } catch (err) {
      setResult("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-content p-4">
        <h3 className="info-box">
          Attach the audio file you want to test to see if it is a deepfake.
          Must be in .WAV format, if not use online convertor to convert to .WAV
        </h3>

        <div className="deepfake-form">
          <input
            type="file"
            accept=".wav"
            onChange={handleFileChange}
            className="file-input"
          />
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="detect-button"
          >
            {loading ? "Processing..." : "Detect Deepfake"}
          </button>
        </div>

        {result && <p className="result-text">{result}</p>}
      </main>
    </>
  );
}
