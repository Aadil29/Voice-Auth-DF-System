
import torch
import torch.nn as nn
import torch.nn.functional as F



class ConvolutionLSTMBlock(nn.Module):
    def __init__(self):
        super().__init__()

        self.conv1 = nn.Conv2d(1, 32, kernel_size=5, padding=2)
        self.bn1 = nn.BatchNorm2d(32)
        self.pool1 = nn.AvgPool2d(2)

        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.pool2 = nn.AvgPool2d(2)


        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.pool3 = nn.AvgPool2d(2)


        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.bn4 = nn.BatchNorm2d(256)
        self.pool4 = nn.AdaptiveAvgPool2d((32, 8))  

        self.dropout = nn.Dropout(0.1)

        self.lstm = nn.LSTM(input_size=8 * 256, hidden_size=512,
                            num_layers=2, batch_first=True, bidirectional=True)

    def forward(self, x):
        x = F.leaky_relu(self.bn1(self.conv1(x)))
        
        x = self.pool1(x)

        x = F.leaky_relu(self.bn2(self.conv2(x)))
        x = self.pool2(x)


        x = F.leaky_relu(self.bn3(self.conv3(x)))
        x = self.pool3(x)

        x = F.leaky_relu(self.bn4(self.conv4(x)))
        x = self.pool4(x)

        x = self.dropout(x)
        x = x.permute(0, 2, 1, 3).reshape(x.size(0), 32, -1)

        out, _ = self.lstm(x)
        return out[:, -1, :]  





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
    



class AudioFusionModel(nn.Module):
    def __init__(self):
        super().__init__()

        self.mel_branch = ConvolutionLSTMBlock()
        self.mfcc_branch = DenseNeuralNetwork(input_dim=40)
        self.chroma_branch = DenseNeuralNetwork(input_dim=12)
        self.tonnetz_branch = DenseNeuralNetwork(input_dim=6)
        self.contrast_branch = DenseNeuralNetwork(input_dim=7)

        self.fc_fusion = nn.Sequential(
            nn.Linear(1024 + 4 * 128, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.ReLU(),  
            nn.Dropout(0.1),
        )

        self.embedding_out = nn.Linear(256, 128)  


    def forward(self, mel, mfcc, chroma, tonnetz, contrast):
        mel_out = self.mel_branch(mel)
        mfcc_out = self.mfcc_branch(mfcc)
        chroma_out = self.chroma_branch(chroma)
        tonnetz_out = self.tonnetz_branch(tonnetz)
        contrast_out = self.contrast_branch(contrast)

        combined = torch.cat([mel_out, mfcc_out, chroma_out, tonnetz_out, contrast_out], dim=1)
        fusion = self.fc_fusion(combined)
        embedding = self.embedding_out(fusion)
        return embedding
