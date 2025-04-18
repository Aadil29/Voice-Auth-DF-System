
---

# Voice-Auth-DF-System

A secure voice authentication system with deepfake audio detection using FastAPI, PyTorch, and Whisper. This project supports real-time voice-based login with spoof detection, integrated with Firebase for authentication and Whisper for transcription.

---

## Clone the Repository

First, clone the repository to your desired location:

```bash
git clone https://github.com/Aadil29/Voice-Auth-DF-System.git
cd Voice-Auth-DF-System
```

---

## Environment Setup

### 1. Install Conda

Download and install Conda for your system by following the instructions here:  
[Conda Installation Guide](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html)

### 2. Create and Activate Conda Environment

```bash
conda create -n final-voice-system-env python=3.10 -y
conda activate final-voice-system-env
```

### 3. Install Required Dependencies

Run the following commands to install the necessary packages:

```bash
# PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# FastAPI and related libraries
pip install fastapi uvicorn python-multipart pydantic aiofiles

# Audio processing and ML libraries
pip install numpy librosa sounddevice scipy pydub noisereduce ipywidgets

# Whisper for transcription
pip install git+https://github.com/openai/whisper.git

# Firebase integration
pip install firebase-admin

# PyAnnote for speaker embeddings
pip install pyannote.audio

# Environment configuration
pip install python-dotenv python-decouple requests
```

### 4. Add Kernel for Jupyter (Optional)

```bash
python -m ipykernel install --user --name final-voice-system-env --display-name "Python (final-voice-system-env)"
```

---

## Open in VS Code

1. Open the project folder in Visual Studio Code.
2. Press `Ctrl + Shift + P` and select **"Python: Select Interpreter"**.
3. Choose the `final-voice-system-env` environment.

---

## Verify `package.json` Scripts

Ensure the following scripts are correctly set in your `package.json`:

```json
"scripts": {
  "api": "C:/Users/Aadil/anaconda3/envs/final-voice-system-env/python -m uvicorn src.main:app --reload",
  "start-all": "concurrently \"npm run dev\" \"npm run api\"",
  "email": "email dev --dir src/app/emails"
}
```



---

## Run the Project

Open a terminal in the project directory and run:

```bash
cd authentication-system-with-df-detection
npm run start-all
```

This will start both the frontend and backend servers.

---

## Access the App

Once the servers are running, open the local URL displayed in your terminal. You should now be able to use the voice authentication system.

---



dataset set up/ downloads

#reasle in teh wild
#vox1_celeb

Evaluation:
ASVspoof 2019
Real Or Fake - for-2sec

fodler stritre needed
