# main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import speech_recognition as sr

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/listen")
def listen_once(passphrase: str = Query(...)):
    recogniser = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("Listening for 10 seconds...")
            recogniser.adjust_for_ambient_noise(source)
            audio = recogniser.listen(source, phrase_time_limit=10)

        text = recogniser.recognize_google(audio).lower()

        # Save to output.txt
        with open("output.txt", "a") as f:
            f.write(text + "\n")

        is_confirmed = passphrase.lower() in text

        return {
            "text": text,
            "confirmed": is_confirmed
        }

    except sr.RequestError as e:
        return {"error": f"API error: {e}"}
    except sr.UnknownValueError:
        return {"error": "Could not understand audio"}
