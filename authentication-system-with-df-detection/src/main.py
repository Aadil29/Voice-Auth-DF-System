from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import whisper
import sounddevice as sd
import numpy as np
import tempfile
import scipy.io.wavfile
import re

# Initialise FastAPI app
app = FastAPI()

# Enable CORS (so frontend can call the backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model (change to "tiny", "base", "small", or "large" if needed)
model = whisper.load_model("medium")

# Helper function to clean text (remove punctuation and lowercase)
def clean_text(text: str) -> str:
    return re.sub(r"[^\w\s]", "", text).lower().strip()

# Listen and transcribe endpoint
@app.get("/listen")
def listen(passphrase: str = Query(...)):
    duration = 7  # seconds
    samplerate = 22050 

    try:
        print("Recording...")
        audio = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='float32')
        sd.wait()

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            scipy.io.wavfile.write(f.name, samplerate, audio)
            audio_path = f.name

        print("Transcribing...")
        result = model.transcribe(audio_path)
        raw_text = result["text"]

        # Clean both transcribed text and passphrase for comparison
        cleaned_text = clean_text(raw_text)
        cleaned_passphrase = clean_text(passphrase)

        is_confirmed = cleaned_passphrase in cleaned_text

    
        return {
            "text": raw_text,
            "confirmed": is_confirmed
        }

    except Exception as e:
        return {"error": str(e)}
