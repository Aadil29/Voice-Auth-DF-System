import librosa
import noisereduce as nr
import numpy as np
import numpy as np
import torch
import torch.nn.functional as F

def preprocess_audio(y, sr=22050, target_duration=6.0, apply_preemphasis=False, apply_reduction=False, coef=0.5, normalise='rms'):
    
    y, _ = librosa.effects.trim(y)

    if apply_reduction:
        y = nr.reduce_noise(y=y, sr=sr)

    if apply_preemphasis:
        y = librosa.effects.preemphasis(y, coef=coef)

    if normalise == 'rms':
        rms = np.sqrt(np.mean(y**2))
        y = y / (rms + 1e-6)
    elif normalise == 'peak':
        y = y / (np.max(np.abs(y)) + 1e-6)


    target_length = int(sr * target_duration)
    if len(y) < target_length:
        y = np.pad(y, (0, target_length - len(y)))
    else:
        y = y[:target_length]

    return y

def pad_or_resize(tensor, target_shape=(128, 259)):
    if tensor.ndim == 1:
        tensor = tensor[None, :]
    h, w = tensor.shape
    pad_h = max(0, target_shape[0] - h)
    pad_w = max(0, target_shape[1] - w)

    if h > target_shape[0] or w > target_shape[1]:
        tensor = tensor[:min(h, target_shape[0]), :min(w, target_shape[1])]
    return F.pad(torch.tensor(tensor, dtype=torch.float32), (0, pad_w, 0, pad_h)).unsqueeze(0)



def extract_features_from_audio(y, sr, mel_shape=(128, 259)):
    try:
        features_raw = {
            "mfcc": librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40),
            "chroma": librosa.feature.chroma_stft(y=y, sr=sr),
            "tonnetz": librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr),
            "spectral_contrast": librosa.feature.spectral_contrast(y=y, sr=sr),
            "mel_spectrogram": librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        }

        features = {
            "mel_spectrogram": pad_or_resize(features_raw["mel_spectrogram"], mel_shape),
            "mfcc": torch.tensor(np.mean(features_raw["mfcc"], axis=1), dtype=torch.float32),
            "chroma": torch.tensor(np.mean(features_raw["chroma"], axis=1), dtype=torch.float32),
            "tonnetz": torch.tensor(np.mean(features_raw["tonnetz"], axis=1), dtype=torch.float32),
            "spectral_contrast": torch.tensor(np.mean(features_raw["spectral_contrast"], axis=1), dtype=torch.float32)
        }

        return features

    except Exception as e:
        print(f"[ERROR] Feature extraction failed: {e}")
        return None

