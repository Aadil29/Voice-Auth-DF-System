# Voice-Auth-DF-System

A secure voice authentication system with deepfake audio detection.

first clone the repo to tyour desired locatrion:
    git clone https://github.com/Aadil29/Voice-Auth-DF-System.git
    
Enviroment setup
conda
foolwo the steps here to donald and istnall conda for your system.
https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html

the env for the place is.

create a env in conda callewd final-voice-system-env

  conda create -n final-voice-system-env python=3.10 -y

activaet this with 
  conda activate final-voice-system-env

  then run these comands:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

pip install fastapi uvicorn
pip install "python-multipart"
pip install pydantic
pip install aiofiles

pip install numpy torch librosa sounddevice scipy pydub

pip install git+https://github.com/openai/whisper.git

pip install firebase-admin

pip install pyannote.audio

pip install "python-dotenv" python-decouple
pip install requests

pip install librosa 
pip install noisereduce
pip install ipywidgets


python -m ipykernel install --user --name final-voice-system-env  --display-name "Python (final-voice-system-env)


now you shodu lbe abel to open the repo in vscode

then press crtl shift p  and slect the env we just created


double check to ensure this is the ois in the josn package under scripts:

"api": "C:/Users/Aadil/anaconda3/envs/final-voice-system-env/python -m uvicorn src.main:app --reload",
    "start-all": "concurrently \"npm run dev\" \"npm run api\"",
    "email": "email dev --dir src/app/emails"



then to run the projecm open teh termoanl in the prikect fdodelr,
  cd authentication-system-with-df-detection
  npm run start-all

this shodu lload up the sver and mail and lcoal host

open the local host tjat appars and you hodu be good to go!



workign microhope:

dataset set up/ downloads

#reasle in teh wild
#vox1_celeb

Evaluation:
ASVspoof 2019
Real Or Fake - for-2sec

fodler stritre needed
