# Voice Authentication System With Deepfake Detection

A secure voice authentication system with audio deepfake detection.

![image](https://github.com/user-attachments/assets/1d7ecefd-e468-4eba-b747-141eb8b5fe6c)

## Table of Contents

- [Prerequisites](#prerequisites-install-if-you-dont-already-have-them)
- [1. Clone the Repository](#1-in-terminal-or-command-prompt-clone-the-repository)
- [2. Environment Setup](#2-environment-setup)
  - [2.1 Create Conda Environment](#in-terminal-or-anaconda-prompt-create-conda-environment)
  - [2.2 Install Dependencies](#in-terminal-or-anaconda-prompt-actiavte-conda-enviroment-and-install-the-following-dependencies)
  - [2.3 NumPy Fix](#numpy-error)
  - [2.4 PyTorch Installation](#pytorch-installation)
  - [2.5 Open in VS Code](#24-open-the-cloned-repository-voice-auth-df-system-in-vs-code)
  - [2.6 Jupyter Setup](#25-python-interpreter-and-jupyter-notebook-setup)
- [3. Model Downloads](#3-model-downloads)
- [4. Deepfake Detection Model Weights](#4-add-deepfake-detection-model-weights-to-pth_models-folder)
- [5. Environment Variables](#5-add-environment-variables)
- [6. Run the Project](#6-run-the-project)
- [7. Access the Website](#7-access-the-website)
- [8. Key Testing Information](#8-key-testing-infomation)
- [Datasets Download](#datasets-download)
- [Project Folder Structure](#project-folder-structure)

## KEY:

If you have access to the code as packaged submission, you may not need to create some folders/files, refer to the folder structre below and confirm before you add any folders/files using commands seen below, as well api keys will have already been added into the .env.local

## Prerequisites (Install If you don't already have them)

1. Git - https://git-scm.com/downloads
2. Anaconda Distribution - https://www.anaconda.com/download

## 1. In Terminal Or Command Prompt Clone the Repository.

Ensure you know where you have cloned the repository, it may be easier to navigate to the desktop using cd and clone the project in that location

```bash
git clone https://github.com/Aadil29/Voice-Auth-DF-System.git
```

---

## 2. Environment Setup

### In Terminal or Anaconda prompt Create Conda Environment

```bash
conda create -n final-voice-system-env python=3.10.16 -y
```

### In terminal or Anaconda prompt, actiavte conda enviroment and install the following dependencies

Activate conda enviroment

```bash
conda activate final-voice-system-env
```

Install Dependencies/packages

```bash
conda install -c conda-forge nodejs=22.1.0
conda install -c conda-forge ffmpeg
conda install anaconda::git-lfs
npm install next react react-dom
pip install fastapi uvicorn python-multipart pydantic aiofiles
pip install numpy librosa sounddevice scipy pydub noisereduce ipywidgets
pip install git+https://github.com/openai/whisper.git
pip install firebase-admin
pip install python-dotenv python-decouple requests
pip install speechbrain
pip install slowapi redis
npm install nodemailer
npm install --save-dev @types/nodemailer
npm install concurrently --save-dev
pip install ipykernel
python -m ipykernel install --user --name final-voice-system-env --display-name "Python (final-voice-system-env)"
```

Numpy Error
If you get a warning about conflicting numpy versions, uninstall and re-install this version, using the following command.

```bash
pip uninstall numpy -y
pip install numpy==1.24.4
```

### Pytorch Installation

Nvidia GPU USAGE ONLY:

Do not install unless your NVIDIA GPU supports cuda v12.2, and you have set cuda up correctly - https://www.youtube.com/watch?v=nATRPPZ5dGE&ab_channel=DSwithBappy.
But ensure to use this version of cuda https://developer.nvidia.com/cuda-12-2-0-download-archive. Once all that is doen you can run the command below

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

#### Default (CPU or non-CUDA GPU):

```bash
pip3 install torch torchvision torchaudio
```

### 2.2 Open the cloned repository (Voice-auth-df-system) in VS Code

### 2.3 Python interpreter and Jupyter notebook setup

1. Open a Jupyter notebook from the following directory voice-auth-df-system/ml-model/
2. In the top-right, select the Python interpreter.
3. If prompted, install Jupyter-related extensions.
4. Select the interpreter: `Python (final-voice-system-env)`.
5. In the search '>Python: select interpreter' in project search, and ensure 'final-voice-system-env' is selected
   ![Screenshot 2025-04-20 184258](https://github.com/user-attachments/assets/0ef2a2a5-7e9f-4cb5-bf06-6de9352b1ec7)
   ![Screenshot 2025-04-20 184315](https://github.com/user-attachments/assets/3bc54821-c92d-4720-b512-c78512177f15)

---

## 3. Model downloads

### 3.1 Download Pretrained Speaker Recognition Model

1.  In terminal or Anaconda prompt where the enviroment is active, run the command to inliase lfs.

```bash
git lfs install
```

2. In project terminal

Create Pretrained_models folder using command below.
![image](https://github.com/user-attachments/assets/5e2b0e14-2698-4049-adea-8ec3152b97d8)

```bash
 mkdir -p authentication-system-with-df-detection/pretrained_models

```

Clone model into the folder just created

```bash
cd authentication-system-with-df-detection/pretrained_models
git clone https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
```

![Screenshot 2025-04-20 185226](https://github.com/user-attachments/assets/34848c11-e951-4f31-911c-bd2be0f330b5)

https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb

## 4. Add deepfake detection model weights to pth_models folder

4.1 In project terminal create this folder

```bash
mkdir authentication-system-with-df-detection/src/pth_models
```

4.2 Download file, unzip and move it into the pth_models folder.
You will see this warning when downloading the file ('Google Drive can't scan this file for viruses.'), but its completly safe, so dont worry:

```bash
https://drive.google.com/file/d/1oP-NXYggC-HDATSESRr3Fhxs9WrCK9sF/view?usp=sharing
```

## 5. Add Environment Variables

5.1 In project terminal create a .env.local file

```bash
echo > authentication-system-with-df-detection/.env.local
```

Populate it with the necessary Firebase and email environment variables. These are not included in the repo for security reasons.These will be sent via secure communication(Will be in the packaged submmsion).

## 6. Run the Project

In project terminal run the commands

```bash
cd authentication-system-with-df-detection
npm run start-all
```

This will start both the frontend and the backend concurrently.

---

## 7. Access the website

Once both servers are running:

- Visit `http://localhost:3000` for the frontend.
- FastAPI backend should be running at `http://localhost:8000`.

You are now ready to test the real-time voice authentication system with deepfake detection.

---

## 8. KEY TESTING INFOMATION

It could be useful to temporarily reduce the similarity threshold (e.g. to 0.4) when testing the authentication mechanism( Main.py line 276 ). Since complete access is necessary after registering before you may explore the dashboard features or remove your account and related personal data, this makes it easier for you to have access during initial testing.

By lowering the threshold, you can test and preview every part of the system, including the usage guidelines, account management, and deepfake detection dashboard. After base functionality has been confirmed, you can gradually raise the threshold to assess how robust and dependable the system gets at higher levels. This helps in assessing the system's resilience to false positives and overall robustness.

# Datasets Download

If you wish to download the datasets to be able to run the code in the jupyter notebooks, be prepared to download around 150GB worth of files, (Only 20GB is actually used)

See project folder structure below, to ensure the datasets are added in the right folders

In the project terminal use the command to create the datasets folder and the evaluations folder

```bash
mkdir ml-modles/datasets
mkdir ml-modles/datasets/evaluation
```

### 1. Release in the wild dataset (~7.6GB) -

Go to the website and select download dataset, then extract and place it in

### voice-auth-df-system/ml-modles/datasets/

This is dataset is needed to run the deepfake-detection jupyter notebook

```bash
Download Link

https://deepfake-total.com/in_the_wild
```

### 2. VoxCeleb1 (~60GB)

This dataset needs to be requested so you need to provide the following details.(You must downald all 4(ABCD)) parts and then concatoante them together to be able to take a sample from it - download the test dataset if you want to test. Place it in

### voice-auth-df-system/ml-modles/datasets/

This is dataset is needed to run the voice-identification jupyter notebook

```bash
Download Link
https://cn01.mmai.io/keyreq/voxceleb
```

### 3. Fake Or Real dataset (for-2sec) (~25GB)

Used the sub set in the fake or real dataset for evaluation purposes for deepfake detection. Only the for-2sec directory was used, but you still need to download entire dataset. Place it in

### voice-auth-df-system/ml-modles/datasets/evaluation

This is dataset is needed to run the EVALUATING ON NEW DATASETS section of the deepfake-detection jupyter notebook

```bash
Download Link
https://www.kaggle.com/datasets/mohammedabdeldayem/the-fake-or-real-dataset
```

### 4. ASVspoof2019 dataset (LA_eval) (~22GB)

Used for evaluation for deepfake detection.Only use the LA_eval for evaluation. Place it in

### voice-auth-df-system/ml-modles/datasets/evaluation

This is dataset is needed to run the EVALUATING ON NEW DATASETS section of the deepfake-detection jupyter notebook

```bash
Download Link
https://www.kaggle.com/datasets/awsaf49/asvpoof-2019-dataset
```

### For datasets, the only base folders are there, meaning; vox1_subset was created via code in the notebbok, so do not make folders, the code will run and make what is need, as long as you have the base datastes in the correct location.

base datasets needed

- release-in-the-wild
- vox1_dev
- for-2sec
- LA

# Project folder structure

voice-auth-df-system

- .vscode
- authentication-system-with-df-detection
  - .next
  - node_modules
  - pretrained_models
    - spkrec-ecapa-voxceleb
  - public
  - src
    - **pycache**
    - app
      - components
        - InputEmail.tsx
        - Navbar.tsx
        - OTPInput.tsx
        - PasswordInput.tsx
        - RecordingCountdown.tsx
        - SignInVoiceAuth.tsx
        - SignUpVoiceAuth.tsx
        - UrlProtection.tsx
      - dashboard
        - deepfake
          - page.tsx
        - privacy
          - page.tsx
        - settings
          - page.tsx
      - page.tsx
    - email
      - route.ts
    - sign-in
      - page.tsx
    - sign-up
      - page.tsx
    - styles
      - base.css
      - components.css
      - globals.css
      - layout.css
      - lettering.css
      - utilities.css
      - variables.css
    - layout.tsx
    - page.tsx
  - pth_models
    - df_model.pth
    - Voice-Train.pth
  - utils
    - example_phrases.ts
    - voiceAverage.ts
    ***
    - deepfake_audio.py
    - deepfake_preprocess_audio.py
    - firebase.ts
    - main.py
    - voice_audio.py
    - voice_preprocess.py
  - .env.local
  - next-env.d.ts
  - next.config.ts
  - package-lock.json
  - package.json
  - postcss.config.mjs
  - tsconfig.json
- ml-models
  - datasets
    - evaluation
      - for-2sec
        - LA
    - preprocessed_vox
    - release_in_the_wild
    - vox1_dev
    - vox1_processed
    - vox1_subset_150
    - vox1_subset_test
  - model-weights
  - Test-pretrained-models
    - speaker_verification_pretrained.ipynb
  - deepfake-detection.ipynb
  - voice-identification.ipynb
- node_modules
- .gitignore
- README.md

![image](https://github.com/user-attachments/assets/8dedb2ca-4a35-4e85-864f-b86c3245f81b)
