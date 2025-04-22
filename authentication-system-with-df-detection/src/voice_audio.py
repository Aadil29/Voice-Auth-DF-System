
import torch
import torch.nn as nn
import torch.nn.functional as F





class ConvolutionLSTMBlock(nn.Module):
    def __init__(self):
        super().__init__()

        # First convolutional block
        self.conv1 = nn.Conv2d(1, 32, kernel_size=5, padding=2)
        self.bn1 = nn.BatchNorm2d(32)
        self.pool1 = nn.AvgPool2d(2)

        # Second convolutional block
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.pool2 = nn.AvgPool2d(2)

        # Third convolutional block
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.pool3 = nn.AvgPool2d(2)

        # Fourth convolutional block with adaptive pooling to fixed size
        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.bn4 = nn.BatchNorm2d(256)
        self.pool4 = nn.AdaptiveAvgPool2d((32, 8))

        # Dropout for regularisation
        self.dropout = nn.Dropout(0.1)

        # LSTM to model temporal structure in feature maps
        self.lstm = nn.LSTM(input_size=8 * 256, hidden_size=512,
                            num_layers=2, batch_first=True, bidirectional=True)

    def forward(self, x):
        # Apply first conv block
        x = F.leaky_relu(self.bn1(self.conv1(x)))
        x = self.pool1(x)

        # Apply second conv block
        x = F.leaky_relu(self.bn2(self.conv2(x)))
        x = self.pool2(x)

        # Apply third conv block
        x = F.leaky_relu(self.bn3(self.conv3(x)))
        x = self.pool3(x)

        # Apply fourth conv block with adaptive pooling
        x = F.leaky_relu(self.bn4(self.conv4(x)))
        x = self.pool4(x)

        # Apply dropout
        x = self.dropout(x)

        # Reshape to match LSTM input: [batch_size, seq_len, features]
        x = x.permute(0, 2, 1, 3).reshape(x.size(0), 32, -1)

        # Pass through LSTM and return final output
        out, _ = self.lstm(x)
        return out[:, -1, :]  # use the last time step's output


class DenseNeuralNetwork(nn.Module):
    def __init__(self, input_dim, output_dim=128):
        super(DenseNeuralNetwork, self).__init__()

        # First FC block
        self.fc1 = nn.Linear(input_dim, 256)
        self.bn1 = nn.BatchNorm1d(256)

        # Second FC block
        self.fc2 = nn.Linear(256, 256)
        self.bn2 = nn.BatchNorm1d(256)

        # Final FC block to produce the embedding
        self.fc3 = nn.Linear(256, output_dim)
        self.bn3 = nn.BatchNorm1d(output_dim)

        self.dropout = nn.Dropout(0.3)
        self.relu = nn.ReLU()

    def forward(self, x):
        # Apply each layer with ReLU, BN, and Dropout
        x = self.relu(self.bn1(self.fc1(x)))
        x = self.dropout(x)

        x = self.relu(self.bn2(self.fc2(x)))
        x = self.dropout(x)

        x = self.relu(self.bn3(self.fc3(x)))
        return x


class AudioFusionModel(nn.Module):
    def __init__(self):
        super().__init__()

        # Branch to handle Mel spectrogram with CNN + LSTM
        self.mel_branch = ConvolutionLSTMBlock()

        # Dense branches for other features
        self.mfcc_branch = DenseNeuralNetwork(input_dim=20)
        self.chroma_branch = DenseNeuralNetwork(input_dim=12)
        self.tonnetz_branch = DenseNeuralNetwork(input_dim=6)
        self.contrast_branch = DenseNeuralNetwork(input_dim=7)

        # Fusion MLP to combine all feature outputs
        self.fc_fusion = nn.Sequential(
            nn.Linear(1024 + 4 * 128, 512),  # mel + 4 branches
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
        )

        # Final embedding layer
        self.embedding_out = nn.Linear(256, 128)

    def forward(self, mel, mfcc, chroma, tonnetz, contrast):
        # Pass each feature through its corresponding branch
        mel_out = self.mel_branch(mel)
        mfcc_out = self.mfcc_branch(mfcc)
        chroma_out = self.chroma_branch(chroma)
        tonnetz_out = self.tonnetz_branch(tonnetz)
        contrast_out = self.contrast_branch(contrast)

        # Concatenate all outputs into a single vector
        combined = torch.cat([mel_out, mfcc_out, chroma_out, tonnetz_out, contrast_out], dim=1)

        # Fuse the combined features and reduce dimensionality
        fusion = self.fc_fusion(combined)

        # Final embedding output
        embedding = self.embedding_out(fusion)

        # Normalise embedding for use in similarity comparisons / triplet loss
        embedding = F.normalize(embedding, p=2, dim=1)
        return embedding