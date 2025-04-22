/*

SignUpVoiceAuth.tsx

A model interface that guides users through a 3-step voice registration process.
Users record 3 audio samples, each of which is sent to the backend to extract embeddings.
Once all samples are recorded, the average embedding is returned via `onComplete`.
This is used during sign-up or profile setup to register the user's voice identity.

*/

"use client";

import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaRedo } from "react-icons/fa";
import RecordingCountdown from "@/app/components/RecordingCountdown";
import { averageVectors } from "@/utils/voiceAverage";

interface VoiceModelProps {
  onClose: () => void;
  onComplete: (avgEmbedding: number[]) => void;
}

export default function VoiceModel({ onClose, onComplete }: VoiceModelProps) {
  const [step, setStep] = useState(1); // tracks current recording step (1 to 3)
  const [embeddings, setEmbeddings] = useState<number[][]>([]); // stores embeddings for each sample
  const [recording, setRecording] = useState(false); // recording state toggle
  const [audioURL, setAudioURL] = useState<string | null>(null); // preview audio blob URL
  const [error, setError] = useState<string | null>(null); // display error messages
  const audioChunks = useRef<Blob[]>([]); // buffer to collect audio stream data

  /* Chose a simple conversational sentence as the first one, second and third are pangrams, help caprture a better representation of their voice */
  const prompts = [
    `Sample 1 of 3:\n\nSpeak in a clear and conversational tone.\n\n“My Name is [Full Name], and Audio Shield Secures and protects your voice.”`,
    `Sample 2 of 3:\n\nSpeak in a clear and conversational tone.\n\n“A mad boxer shot a quick, gloved jab to the jaw of his dizzy opponent.”`,
    `Sample 3 of 3:\n\nSpeak in a clear and conversational tone.\n\n“The quick brown fox jumps over the lazy dog.”`,
  ];

  // Allow closing the modal via Escape key for convenience
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Helper to send audio blob to backend and get back the voice embedding
  const extractEmbedding = async (blob: Blob): Promise<number[]> => {
    const form = new FormData();
    form.append("file", blob, "sample.webm");

    const res = await fetch("http://localhost:8000/extract-embedding/", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok || !data.embedding) {
      throw new Error("Embedding extraction failed");
    }

    return data.embedding;
  };

  // Start recording audio sample from the microphone
  const startRecording = async () => {
    try {
      setError(null); // reset any previous errors
      setAudioURL(null); // clear previously recorded audio
      setRecording(true); // toggle UI into recording state

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      // collect audio chunks into buffer
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      // when recording stops, process audio and send to backend
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop()); // stop all mic input
        setRecording(false);

        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob)); // set preview audio

        try {
          const vec = await extractEmbedding(blob); // send to backend
          setEmbeddings((prev) => [...prev, vec]); // add to embedding list
        } catch {
          setError("Failed to extract embedding. Please retry this sample.");
        }
      };

      recorder.start();

      // stop recording after 6 seconds
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 6000);
    } catch {
      // fallback if mic access denied or any other issue
      setError("Microphone access denied.");
      setRecording(false);
    }
  };

  // Allow user to redo current sample if needed
  const handleReRecord = () => {
    setAudioURL(null);
    setError(null);
    startRecording(); // simply re-trigger same process
  };

  // Progress to next sample or finish if all 3 are done
  const handleNext = () => {
    // Check if current sample was actually recorded
    if (!audioURL || embeddings.length < step) {
      setError("Please record and wait for embedding.");
      return;
    }

    if (step < 3) {
      setStep(step + 1); // go to next prompt
      setAudioURL(null); // clear audio for next round
      setError(null);
    } else {
      // Final step: average embeddings and return to parent
      const avg = averageVectors(embeddings);
      onComplete(avg);
    }
  };

  return (
    <div className="voice-model-backdrop">
      <div className="voice-model">
        <button className="close-model" onClick={onClose}>
          ×
        </button>

        <h2>Voice Registration</h2>

        <p
          className="voice-prompt"
          style={{ whiteSpace: "pre-wrap", marginBottom: "1rem" }}
        >
          {prompts[step - 1]}
        </p>

        {/* Show error if any */}
        {error && <p className="error-message">{error}</p>}

        {/* Show “Start Recording” button if not currently recording or already recorded */}
        {!recording && !audioURL && (
          <button onClick={startRecording} className="btn-primary">
            <FaMicrophone /> Start Recording
          </button>
        )}

        {/* Show countdown while actively recording */}
        {recording && (
          <p className="recording-text">
            Recording… <RecordingCountdown duration={6} active={recording} />
          </p>
        )}

        {/* Audio preview and next actions */}
        {audioURL && (
          <>
            <audio controls src={audioURL}></audio>

            <div className="model-buttons">
              <button onClick={handleReRecord} className="btn-secondary">
                <FaRedo /> Re‑record Sample
              </button>

              <button onClick={handleNext} className="btn-primary">
                {step < 3 ? "Next Sample" : "Finish Registration"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
