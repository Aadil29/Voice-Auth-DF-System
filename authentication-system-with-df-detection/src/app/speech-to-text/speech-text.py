import speech_recognition as sr

# Initialise the recognizer
r = sr.Recognizer()

# Define the trigger phrase (can be anything you want)
trigger_phrase = "pencil case"

# Function to record speech and return it as text
def record_text():
    while True:
        try:
            with sr.Microphone() as source2:
                print("Listening...")
                r.adjust_for_ambient_noise(source2, duration=0.2)
                audio2 = r.listen(source2)

                MyText = r.recognize_google(audio2)
                MyText = MyText.lower()
                return MyText

        except sr.RequestError as e:
            print(f"Could not request results; {e}")
        except sr.UnknownValueError:
            print("Could not understand audio.")

# Function to write text to a file
def output_text(text):
    with open("output.txt", "a") as f:
        f.write(text + "\n")

# Main loop
while True:
    text = record_text()
    output_text(text)
    print(f"Recognized: {text}")

    if trigger_phrase in text:
        print(f"Trigger phrase detected: '{trigger_phrase}' was spoken.")
        break
