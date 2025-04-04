"use client";
import { useState } from "react";

export default function VoiceAuth() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVoiceAuth = async () => {
    setLoading(true);
    setText("");
  
    try {
      const res = await fetch("http://localhost:8000/listen");
      const data = await res.json();
  
      if (data.error) {
        setText(data.error);
      } else if (data.confirmed) {
        setText(`✅ Confirmed! You said: "${data.text}"`);
      } else {
        setText(` Passphrase not recognized. You said: "${data.text}"`);
      }
    } catch (error) {
      setText("Failed to connect to server.");
    }
  
    setLoading(false);
  };
  
  
  
  return (
    <div style={{ marginTop: "2rem" }}>
      <button onClick={handleVoiceAuth} disabled={loading}>
        {loading ? "Listening..." : "Start Voice Authentication"}
      </button>
      {text && <p>{text}</p>}
    </div>
  );
}
