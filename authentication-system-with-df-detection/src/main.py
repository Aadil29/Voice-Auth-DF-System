"""
Main FastAPI server for the Audio Shield project.

This server handles:
- Real-time recording and transcription (Whisper)
- Deepfake detection via a fusion model
- Voice authentication using speaker embeddings (speechbrains pre trained model - spkrec-ecapa-voxceleb)
- Email verification and Firebase integration
- Audio preprocessing, conversion, and feature extraction
"""

# FastAPI core
from fastapi import FastAPI, Query, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Whisper & Audio I/O
import whisper
import sounddevice as sd
import scipy.io.wavfile
import librosa
import io
import tempfile

# Audio processing
import numpy as np
import torch
import torch.nn.functional as F

# Firebase
import firebase_admin
from firebase_admin import credentials, firestore,initialize_app

# Deepfake detection
from src.deepfake_audio import AudioDeepfakeFusionModel
from src.deepfake_preprocess_audio import dfextract_features_from_audio, dfpreprocess_audio

# Speaker verification
from scipy.spatial.distance import cosine

# Audio format conversion
from pydub import AudioSegment

# Utilities
import re
import os


from dotenv import load_dotenv

load_dotenv(".env.local")  # Load environment variables

if not firebase_admin._apps:
    private_key = os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n")

    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": os.environ["FIREBASE_PROJECT_ID"],
        "private_key_id": os.environ["FIREBASE_PRIVATE_KEY_ID"],
        "private_key": private_key,
        "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
        "client_id": os.environ["FIREBASE_CLIENT_ID"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.environ['FIREBASE_CLIENT_EMAIL'].replace('@', '%40')}"
    })

    initialize_app(cred)


#FastAPI App Setup 
app = FastAPI()

# Allow frontend access (adjust origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper transcription model
model = whisper.load_model("medium")

# Simple preprocessor for comparing text against expected passphrase
def clean_text(text: str) -> str:
    return re.sub(r"[^\w\s]", "", text).lower().strip()

#Whisper Transcription Endpoint
@app.get("/listen")
def listen(passphrase: str = Query(...)):
    duration = 6  
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
        raw_text = result.get("text", "")

        cleaned_text = clean_text(raw_text)
        cleaned_passphrase = clean_text(passphrase)

        is_confirmed = cleaned_passphrase in cleaned_text

        return {"text": raw_text, "confirmed": is_confirmed}
    except Exception as e:
        return {"error": str(e)}


#Deepfake Detection (WAV upload)
model_df = AudioDeepfakeFusionModel()
model_path = os.path.join(os.path.dirname(__file__), "pth_models", "df_model.pth")
model_df.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
model_df.eval()

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050)

        y = dfpreprocess_audio(y, sr=22050, target_duration=6.0, apply_preemphasis=False, coef=0.5, normalise='rms')
        features = dfextract_features_from_audio(y, sr, target_shape=(128, 259))
        if features is None:
            return {"error": "Feature extraction failed."}

        # Run features through model
        inputs = [features[k] for k in [
            'mfcc', 'chroma', 'tonnetz', 'spectral_contrast', 'pitch',
            'energy', 'zcr', 'onset_strength', 'spectral_centroid', 'mel_spectrogram'
        ]]

        with torch.no_grad():
            output = model_df(*inputs)
            prob = output.item()
            label = "bonafide" if prob >= 0.5 else "spoof"

        return {"prediction": label, "confidence": round(prob, 2)}
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}


#Deepfake Detection (WEBM/Frontend use)
@app.post("/deepfake-auth-predict/")
async def deepfake_auth_predict(file: UploadFile = File(...)):
    try:
        # Save uploaded WEBM
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
            temp_webm.write(await file.read())
            webm_path = temp_webm.name

        # Convert to WAV
        wav_path = convert_webm_to_wav(webm_path)

        # Load and process
        y, sr = librosa.load(wav_path, sr=22050)
        y = dfpreprocess_audio(y, sr=sr, target_duration=6.0, apply_preemphasis=False, coef=0.5, normalise="rms")
        features = dfextract_features_from_audio(y, sr, target_shape=(128, 259))
        if features is None:
            return {"error": "Feature extraction failed."}

        # Predict
        inputs = [features[k] for k in features]
        with torch.no_grad():
            output = model_df(*inputs)
            prob = torch.sigmoid(output).item()
            label = "bonafide" if prob >= 0.5 else "spoof"

        return {"prediction": label, "confidence": round(prob, 2)}
    except Exception as e:
        return JSONResponse(content={"error": f"Deepfake auth prediction failed: {str(e)}"}, status_code=500)


#Speaker Verification Model
from speechbrain.inference.speaker import SpeakerRecognition
speaker_model = SpeakerRecognition.from_hparams(source="pretrained_models/spkrec-ecapa-voxceleb")

import torchaudio

def get_embedding(wav_path: str):
    signal, fs = torchaudio.load(wav_path)
    embedding = speaker_model.encode_batch(signal)
    return embedding.squeeze().detach().cpu().numpy().tolist()


#Convert WEBM to WAV
def convert_webm_to_wav(webm_path):
    audio = AudioSegment.from_file(webm_path, format="webm")
    audio = audio.set_channels(1).set_frame_rate(22050)
    wav_path = webm_path.replace(".webm", ".wav")
    audio.export(wav_path, format="wav")
    return wav_path


#Extract Voice Embedding
@app.post("/extract-embedding/")
async def extract_embedding(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
            temp_webm.write(await file.read())
            webm_path = temp_webm.name

        wav_path = convert_webm_to_wav(webm_path)
        embedding = get_embedding(wav_path)

        os.remove(webm_path)
        os.remove(wav_path)

        return JSONResponse(content={"embedding": embedding}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


#Compare New vs Stored Embedding
def compare_embeddings(embedding1, embedding2, threshold=0.7):
    similarity = 1 - cosine(embedding1, embedding2)
    return similarity, similarity >= threshold


#Speaker Verification (Login Check)
@app.post("/verify-embedding/")
async def verify_embedding(file: UploadFile = File(...), uid: str = Form(...)):
    try:
        # Save uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(await file.read())
            webm_path = temp_file.name

        wav_path = convert_webm_to_wav(webm_path)
        new_embedding = get_embedding(wav_path)

        os.remove(webm_path)
        os.remove(wav_path)

        # Retrieve stored embedding from Firebase
        doc = firestore.client().collection("voiceEmbeddings").document(uid).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User embedding not found.")

        stored_embedding = doc.to_dict().get("embedding")
        if not stored_embedding:
            raise HTTPException(status_code=404, detail="Stored embedding is missing.")

        similarity, confirmed = compare_embeddings(new_embedding, stored_embedding)

        return {
            "similarity": float(similarity),
            "confirmed": bool(confirmed)
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
