/* 
  This page allows users to upload a .wav audio file and submit it to the backend 
  for deepfake detection. The response includes a prediction label and confidence score. 
  The page also handles loading states and displays any errors returned by the server.
*/

"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";

export default function DeepfakeDetectionPage() {
  const [file, setFile] = useState<File | null>(null); // Holds the selected .wav file
  const [result, setResult] = useState<string | null>(null); // Stores the prediction or error
  const [loading, setLoading] = useState(false); // True while the file is being sent and processed

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]); // Update file state with the selected file
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true); // Disable button and show "Processing..."
    setResult(null); // Clear previous result

    const formData = new FormData();
    formData.append("file", file); // Attach the selected file to the POST request

    try {
      const res = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setResult("Error: " + data.error); // Show error if backend returns one
      } else {
        // Format prediction and confidence as a readable string
        setResult(`Prediction: ${data.prediction.toUpperCase()}`);
      }
    } catch (err) {
      setResult("Failed to connect to server."); // Network or server error
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <Navbar />

      <main className="dashboard-content p-4">
        <h3 className="info-box">
          Attach the audio file you want to test to see if it is a deepfake.
          Must be in .WAV format when uploaded, if not use online convertor to
          convert to .WAV
        </h3>
        <h4>
          The results may not always be accurate, so please don’t treat them as
          definitive or use them as evidence. This tool is for learning and
          demonstration purposes.
        </h4>

        <div className="deepfake-form">
          <input
            type="file"
            accept=".wav" // Only allow .wav files
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
