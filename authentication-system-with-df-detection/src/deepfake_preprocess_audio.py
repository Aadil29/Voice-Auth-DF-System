import numpy as np
import librosa
import torch
import torch.nn.functional as F

def dfpreprocess_audio(y, sr, target_duration=6.0, apply_preemphasis=False, coef=0.5, normalise='rms'):
    y, _ = librosa.effects.trim(y)
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

def dfpad_or_resize(tensor, target_shape=(128, 259)):
    if tensor.ndim == 1:
        tensor = tensor[None, :]
    h, w = tensor.shape
    pad_h = max(0, target_shape[0] - h)
    pad_w = max(0, target_shape[1] - w)

    if h > target_shape[0] or w > target_shape[1]:
        tensor = tensor[:min(h, target_shape[0]), :min(w, target_shape[1])]

    return F.pad(torch.tensor(tensor, dtype=torch.float32), (0, pad_w, 0, pad_h)).unsqueeze(0)

def dfextract_features_from_audio(y, sr, target_shape=(128, 259)):
    try:
        feature_dict = {
            "mfcc": librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20),
            "chroma": librosa.feature.chroma_stft(y=y, sr=sr),
            "tonnetz": librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr),
            "spectral_contrast": librosa.feature.spectral_contrast(y=y, sr=sr),
            "pitch": librosa.yin(y, fmin=50, fmax=300, sr=sr).reshape(1, -1),
            "energy": librosa.feature.rms(y=y),
            "zcr": librosa.feature.zero_crossing_rate(y),
            "onset_strength": librosa.onset.onset_strength(y=y, sr=sr).reshape(1, -1),
            "spectral_centroid": librosa.feature.spectral_centroid(y=y, sr=sr),
            "mel_spectrogram": librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        }

        for k in feature_dict:
            feature_dict[k] = dfpad_or_resize(feature_dict[k], target_shape)

        return feature_dict

    except Exception as e:
        print(f"[ERROR] Feature extraction failed: {e}")
        return None
