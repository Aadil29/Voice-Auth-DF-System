from fastapi import FastAPI, Query,File, UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
import whisper
import sounddevice as sd
import numpy as np
import tempfile
import scipy.io.wavfile
import re
import torch 



import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate("src/firebase-admin.json")
    firebase_admin.initialize_app(cred)





app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

# Load Whisper model (change to "tiny", "base", "small", or "large" )
model = whisper.load_model("medium")

def clean_text(text: str) -> str:
    return re.sub(r"[^\w\s]", "", text).lower().strip()

@app.get("/listen")
def listen(passphrase: str = Query(...)):
    duration = 5  
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

        cleaned_text = clean_text(raw_text)
        cleaned_passphrase = clean_text(passphrase)

        is_confirmed = cleaned_passphrase in cleaned_text

    
        return {
            "text": raw_text,
            "confirmed": is_confirmed
        }

    except Exception as e:
        return {"error": str(e)}





from src.deepfake_audio import AudioDeepfakeFusionModel
from src.deepfake_preprocess_audio import dfextract_features_from_audio, dfpreprocess_audio
import torch.nn.functional as F



import torch
import librosa  
import io
import os

model_df = AudioDeepfakeFusionModel()
model_path = os.path.join(os.path.dirname(__file__), "df2_model.pth")
model_df.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
model_df.eval()

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050)

        y = dfpreprocess_audio(y, sr)
        features = dfextract_features_from_audio(y, sr)
        if features is None:
            return {"error": "Feature extraction failed."}

        inputs = [features[k] for k in [
            'mfcc', 'chroma', 'tonnetz', 'spectral_contrast', 'pitch',
            'energy', 'zcr', 'onset_strength', 'spectral_centroid', 'mel_spectrogram'
        ]]

        with torch.no_grad():
            output = model_df(*inputs)
            prob = output.item()
            label = "bonafide" if prob >= 0.5 else "spoof"

        return {"prediction": label, "confidence": round(prob, 4)}

    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}





import os
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from firebase_admin import firestore, credentials
import firebase_admin
from scipy.spatial.distance import cosine







from pyannote.audio import Audio
from pyannote.audio.pipelines.speaker_verification import PretrainedSpeakerEmbedding
from scipy.spatial.distance import cosine
import torchaudio
import torch

# Load speaker embedding model from Hugging Face
model = PretrainedSpeakerEmbedding("pyannote/embedding", device="cpu")
audio = Audio(sample_rate=16000)

def get_embedding(wav_path: str):
    waveform, sample_rate = audio(wav_path)  
    with torch.inference_mode():
        embedding = model(waveform)
    return embedding.squeeze().tolist()  

from pydub import AudioSegment

def convert_webm_to_wav(webm_path):
    wav_path = webm_path.replace(".webm", ".wav")
    AudioSegment.from_file(webm_path, format="webm").export(wav_path, format="wav")
    return wav_path




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

def compare_embeddings(embedding1, embedding2, threshold=0.5):
    similarity = 1 - cosine(embedding1, embedding2)
    return similarity, similarity >= threshold


@app.post("/verify-embedding/")
async def verify_embedding(file: UploadFile = File(...), uid: str = Form(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(await file.read())
            webm_path = temp_file.name

        wav_path = convert_webm_to_wav(webm_path)
        new_embedding = get_embedding(wav_path)

        os.remove(webm_path)
        os.remove(wav_path)

        doc = firestore.client().collection("voiceEmbeddings").document(uid).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User embedding not found.")

        stored_embedding = doc.to_dict().get("embedding")
        if not stored_embedding:
            raise HTTPException(status_code=404, detail="Stored embedding is missing.")

        similarity, confirmed = compare_embeddings(new_embedding, stored_embedding)
        
        similarity = float(similarity)
        confirmed = bool(confirmed)


        return {
            "similarity": similarity,
            "confirmed": confirmed
        }


    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

