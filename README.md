


# Voice Authentication System With Deepfake Detection

A secure voice authentication system with deepfake audio detection. This project supports real-time voice-based login with spoof detection, integrated with Firebase for authentication and Whisper for transcription for speech independant verification and authentication.


![Screenshot 2025-04-19 151923](https://github.com/user-attachments/assets/752c0612-4e95-41a1-a254-90979ed255a6)



## Clone the Repository !!!!!

First, clone the repository to your desired location use term:

```bash
git clone https://github.com/Aadil29/Voice-Auth-DF-System.git
```

```bash
cd Voice-Auth-DF-System
```


---

## Environment Setup

### 1. Install Conda

Download and install Conda for your system by following the instructions here (use the **distribution version**):  
[Conda Installation Guide](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html)

After installation, run:

```bash
conda info
```

to verify it's correctly installed.

---

### 2. Create and Activate Conda Environment

```bash
conda create -n final-voice-system-env python=3.10.16 -y
conda activate final-voice-system-env
```

> *(Note: version `3.10.16` can be adjusted if needed — still under test for compatibility.)*

---

### 3. Install Required Dependencies

Run the following commands **with your Conda environment activated**:

```bash
# PyTorch with CUDA - IF YOUR GPU HAS THE MATCHING CUDA COMPATABILITY(helps to speed up training and testing)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# FastAPI and related libraries
pip install fastapi uvicorn python-multipart pydantic aiofiles

# Audio processing and ML libraries
pip install numpy librosa sounddevice scipy pydub noisereduce ipywidgets

# Whisper for transcription
pip install git+https://github.com/openai/whisper.git

# Firebase integration
pip install firebase-admin

# Environment configuration
pip install python-dotenv python-decouple requests

# SpeechBrain (Speaker Recognition)
pip install speechbrain
```

---

### 4. FFmpeg Installation

#### Windows:

Download and extract FFmpeg from this link:  
[FFmpeg Windows Build](https://github.com/BtbN/FFmpeg-Builds/releases/tag/autobuild-2025-01-31-12-58)


#### macOS:

```bash
conda install -c conda-forge ffmpeg
```

---

### 5. Open the Project in VS Code

1. Open the project folder (`Voice-Auth-DF-System`) in Visual Studio Code.
2. In the terminal inside VS Code, run:

   ```bash
   conda activate final-voice-system-env
   ```

3. Install frontend email dependencies (decice wheneter in cd auth voice system or root of clone i.e in voice auth ):

   ```bash
   npm install nodemailer
   npm install --save-dev @types/nodemailer
   npm install concurrently --save-dev
   ```

4. For Jupyter notebooks and python interpreter setup:

   - Open a notebook.
   - In the top-right, select the Python interpreter.
   - If prompted, install Jupyter-related extensions.
   - Select the interpreter: `Python (final-voice-system-env)`.

---



---

### 6. Download Pretrained Speaker Recognition Model

1. Follow instructions from Hugging Face to install `git-lfs`:
   ```bash
   brew install git-lfs  # macOS
   git lfs install
   ```

   ```bash
   https://git-lfs.com/  #download and run this, ensure to choose windows
   git lfs install
   ```
   Should see "Git LFS initialized" 

2. Then clone the pretrained model into the pretrained models folder

   ```bash
    cd/authentication-system-with-df-detection/pretrained_models:
   ```

   ```bash
   git clone https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
   ```

You should now have this structure:

```
authentication-system-with-df-detection/
└── pretrained_models/
    └── spkrec-ecapa-voxceleb/
```

---


### 7. Add deepfake model weights to pth_models folder

download this file then unzip and create pth_models in `authentication-system-with-df-detection/src/`

```bash
[python -m ipykernel install --user --name final-voice-system-env --display-name "Python (final-voice-system-env)"](https://drive.google.com/file/d/1oP-NXYggC-HDATSESRr3Fhxs9WrCK9sF/view?usp=sharing)
```
### 8. Add Kernel for Jupyter

```bash
python -m ipykernel install --user --name final-voice-system-env --display-name "Python (final-voice-system-env)"
```


### 9. Add Environment Variables

In the `authentication-system-with-df-detection/` directory, create a `.env.local` file.

Populate it with the necessary Firebase and backend environment variables. These are not included in the repo for security reasons.
https://drive.google.com/file/d/1oP-NXYggC-HDATSESRr3Fhxs9WrCK9sF/view?usp=sharing

You will see this warning, but its completly safe, so dont worry: 'Google Drive can't scan this file for viruses.'

---

### 10. Verify `package.json` Scripts and project folder

Ensure your `package.json` includes the following scripts:

```json
   "api": "python -m uvicorn src.main:app --reload",
    "start-all": "concurrently \"npm run dev\" \"npm run api\"",
    "email": "email dev --dir src/app/emails"

```
![Screenshot 2025-04-19 024621](https://github.com/user-attachments/assets/8b54ccde-4c64-45a9-afb7-d0e86653ef0a) : ![Screenshot 2025-04-19 024841](https://github.com/user-attachments/assets/095ebd05-efa4-4f7c-972f-03bd78c736b3)


> You may need to update the `"api"` path if your Python environment is located elsewhere on macOS or Linux.

---

### 11. Run the Project

Open a terminal in the root project directory and run:

```bash
cd authentication-system-with-df-detection
npm run start-all
```

This will start both the **FastAPI backend** and the **Next.js frontend** concurrently.

---

### 12. Access the website

Once both servers are running:

- Visit `http://localhost:3000` for the frontend.
- FastAPI backend should be running at `http://localhost:8000`.

You are now ready to test the real-time voice authentication system with deepfake detection.

---


## Datasets Download 
If you wish to dowlad the daastets to be abel to run the code in the jypster notebooks, be prearped to download around 100GB worth of files,(Only 20GB is actually used)


### 1. Release in the wild dataset (~7.6GB)

Go to the webiste and select download dataset, then extract and place it in voice-auth-df-system/ml-modles/datasets/

```bash
https://deepfake-total.com/in_the_wild
```

### 2. VoxCeleb1 (~60GB)

This dataset needs to be requested so you need to provide the following details.(You must downald all 4(ABCD) parts and then concoate them togterh to be abel to take a sample from it) download the test dataset if you want to test.

Firstname, Surname, Affilicaion, Email

```bash
https://cn01.mmai.io/keyreq/voxceleb
```

### 3. Fake Or Real dataset (for-2sec) (~25GB)
Used the sub set in the fake or real dataset for evaluation purposes for deepfake detection. Only the for-2sec directory was used, but you still need to download entire dataset.

```bash
[https://cn01.mmai.io/keyreq/voxceleb](https://www.kaggle.com/datasets/mohammedabdeldayem/the-fake-or-real-dataset)
```
### 4. ASVspoof2019 dataset (LA_eval) (~22GB)
Used for evaluation for deepfake detection.Only used the LA_eval for evaluation

```bash
https://www.kaggle.com/datasets/awsaf49/asvpoof-2019-dataset
```

