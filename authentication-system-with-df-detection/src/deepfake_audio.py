import torch
import torch.nn as nn
import torch.nn.functional as F

class DenseNeuralNetwork(nn.Module):
    def __init__(self, input_dim, output_dim=128):
        super(DenseNeuralNetwork, self).__init__()
        self.fc1 = nn.Linear(input_dim, 256)
        self.bn1 = nn.BatchNorm1d(256)

        self.fc2 = nn.Linear(256, 256)
        self.bn2 = nn.BatchNorm1d(256)

        self.fc3 = nn.Linear(256, output_dim)
        self.bn3 = nn.BatchNorm1d(output_dim)

        self.dropout = nn.Dropout(0.3)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.bn1(self.fc1(x)))
        x = self.dropout(x)
        x = self.relu(self.bn2(self.fc2(x)))
        x = self.dropout(x)
        x = self.relu(self.bn3(self.fc3(x)))
        return x


class SiameseMFCCBranch(nn.Module):
    def __init__(self):
        super(SiameseMFCCBranch, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)

        self.pool = nn.MaxPool2d(2)
        self.dropout = nn.Dropout(0.5)

        self.flattened_size = 128 * 32 * 64  
        self.fc = nn.Linear(self.flattened_size, 128)

    def forward(self, x):
        x = F.relu(self.conv1(x))        
        x = self.pool(F.relu(self.conv2(x)))  
        x = self.pool(F.relu(self.conv3(x)))  
        x = self.dropout(x)
        x = x.view(x.size(0), -1)         
        x = self.fc(x)                    
        return x


class AudioDeepfakeFusionModel(nn.Module):
    def __init__(self):
        super(AudioDeepfakeFusionModel, self).__init__()

        self.mfcc_branch = SiameseMFCCBranch()

        self.chroma_branch = DenseNeuralNetwork(input_dim=128)
        self.tonnetz_branch = DenseNeuralNetwork(input_dim=128)
        self.contrast_branch = DenseNeuralNetwork(input_dim=128)
        self.pitch_branch = DenseNeuralNetwork(input_dim=128)
        self.energy_branch = DenseNeuralNetwork(input_dim=128)
        self.zcr_branch = DenseNeuralNetwork(input_dim=128)
        self.onset_branch = DenseNeuralNetwork(input_dim=128)
        self.centroid_branch = DenseNeuralNetwork(input_dim=128)
        self.mel_spec_branch = DenseNeuralNetwork(input_dim=128)

        self.fusion_layer = nn.Sequential(
            nn.Linear(10 * 128, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
        )
        self.output_layer = nn.Linear(256, 1)

    def forward(self, mfcc, chroma, tonnetz, contrast, pitch, energy, zcr, onset, centroid, mel_spec):
        mfcc = mfcc.unsqueeze(1)  

        def pool(x): return x.mean(dim=-1)  

        mfcc_out = self.mfcc_branch(mfcc)
        chroma_out = self.chroma_branch(pool(chroma))
        tonnetz_out = self.tonnetz_branch(pool(tonnetz))
        contrast_out = self.contrast_branch(pool(contrast))
        pitch_out = self.pitch_branch(pool(pitch))
        energy_out = self.energy_branch(pool(energy))
        zcr_out = self.zcr_branch(pool(zcr))
        onset_out = self.onset_branch(pool(onset))
        centroid_out = self.centroid_branch(pool(centroid))
        mel_spec_out = self.mel_spec_branch(pool(mel_spec))

        fusion = torch.cat([
            mfcc_out, chroma_out, tonnetz_out, contrast_out,
            pitch_out, energy_out, zcr_out, onset_out, centroid_out, mel_spec_out
        ], dim=1)

        x = self.fusion_layer(fusion)
        return torch.sigmoid(self.output_layer(x))


