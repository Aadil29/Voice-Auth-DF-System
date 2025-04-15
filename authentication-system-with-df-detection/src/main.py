from fastapi import FastAPI, Query,File, UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
import whisper
import sounddevice as sd
import numpy as np
import tempfile
import scipy.io.wavfile
import re



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
            prob = torch.sigmoid(output).item()
            label = "bonafide" if prob >= 0.5 else "spoof"

        return {"prediction": label, "confidence": round(prob, 4)}

    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}






import tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from pydub import AudioSegment

from src.voice_preprocess import extract_features_from_audio, preprocess_audio
from src.voice_audio import AudioFusionModel


# Load model
model_voice = AudioFusionModel()
model_path_voice = os.path.join(os.path.dirname(__file__), "voice_model.pth")
model_voice.load_state_dict(torch.load(model_path_voice, map_location=torch.device("cpu")))
model_voice.eval()

@app.post("/extract-embedding/")
async def extract_embedding(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
            temp_webm.write(await file.read())
            temp_webm.flush()
            webm_path = temp_webm.name

        audio = AudioSegment.from_file(webm_path, format="webm")
        wav_path = webm_path.replace(".webm", ".wav")
        audio.export(wav_path, format="wav")

        y, sr = librosa.load(wav_path, sr=16000)

        y = preprocess_audio(y, sr)
        features = extract_features_from_audio(y, sr)
        if not features:
            os.remove(webm_path)
            os.remove(wav_path)
            return JSONResponse(content={"error": "Feature extraction failed"}, status_code=400)

        mel = features["mel_spectrogram"]
        mfcc = features["mfcc"].squeeze(0)
        chroma = features["chroma"].squeeze(0)
        tonnetz = features["tonnetz"].squeeze(0)
        contrast = features["spectral_contrast"].squeeze(0)

        with torch.no_grad():
            embedding = model_voice(
                mel.unsqueeze(0),
                mfcc.unsqueeze(0),
                chroma.unsqueeze(0),
                tonnetz.unsqueeze(0),
                contrast.unsqueeze(0)
            )

        embedding_vector = embedding.squeeze().tolist()

        os.remove(webm_path)
        os.remove(wav_path)

        return JSONResponse(content={"embedding": embedding_vector}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)




from fastapi import UploadFile, File, Form
from firebase_admin import firestore
from scipy.spatial.distance import cosine

@app.post("/verify-embedding/")
async def verify_embedding(file: UploadFile = File(...), uid: str = Form(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(await file.read())
            temp_file.flush()
            webm_path = temp_file.name

        # Convert to .wav
        audio = AudioSegment.from_file(webm_path, format="webm")
        wav_path = webm_path.replace(".webm", ".wav")
        audio.export(wav_path, format="wav")

        y, sr = librosa.load(wav_path, sr=16000)
        y = preprocess_audio(y, sr)
        features = extract_features_from_audio(y, sr)
        if not features:
            return {"error": "Feature extraction failed"}

        mel = features["mel_spectrogram"]
        mfcc = features["mfcc"]
        chroma = features["chroma"]
        tonnetz = features["tonnetz"]
        contrast = features["spectral_contrast"]

        with torch.no_grad():
            test_embedding = model_voice(
                mel.unsqueeze(0),
                mfcc.unsqueeze(0),
                chroma.unsqueeze(0),
                tonnetz.unsqueeze(0),
                contrast.unsqueeze(0)
            ).squeeze().numpy()

        doc_ref = firestore.client().collection("voiceEmbeddings").document(uid)
        doc = doc_ref.get()
        if not doc.exists:
            return {"error": "User voice not found"}

        saved_embedding = doc.to_dict().get("embedding")
        if not saved_embedding:
            return {"error": "Stored embedding missing"}

        # Cosine similarity
        similarity = 1 - cosine(test_embedding, saved_embedding)
        confirmed = bool(similarity >= 0.8)


        return {
            "similarity": similarity,
            "confirmed": confirmed,
            "test_embedding": test_embedding.tolist(),
            "saved_embedding": saved_embedding
        }


    except Exception as e:
        return {"error": str(e)}
