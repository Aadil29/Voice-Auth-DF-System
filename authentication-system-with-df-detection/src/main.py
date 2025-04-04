# main.py
from fastapi import FastAPI
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

# Define your passphrase
PASS_PHRASE = "password 123"

@app.get("/listen")
def listen_once():
    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("Listening for 10 seconds...")
            recognizer.adjust_for_ambient_noise(source)
            audio = recognizer.listen(source, phrase_time_limit=10)

        text = recognizer.recognize_google(audio).lower()

        # Save the result to a file (optional)
        with open("output.txt", "a") as f:
            f.write(text + "\n")

        is_confirmed = PASS_PHRASE in text

        return {
            "text": text,
            "confirmed": is_confirmed
        }

    except sr.RequestError as e:
        return {"error": f"API error: {e}"}
    except sr.UnknownValueError:
        return {"error": "Could not understand audio"}
