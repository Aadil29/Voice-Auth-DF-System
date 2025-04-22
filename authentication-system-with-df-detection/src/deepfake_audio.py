import torch
import torch.nn as nn
import torch.nn.functional as F
# Used for the all features  but mfcc
class DenseNeuralNetwork(nn.Module):
    def __init__(self, input_dim, output_dim=128):
        super(DenseNeuralNetwork, self).__init__()
       
        # First dense layer with batch norm
        self.fc1 = nn.Linear(input_dim, 256)
        self.bn1 = nn.BatchNorm1d(256)

        # Second dense layer with batch norm
        self.fc2 = nn.Linear(256, 256)
        self.bn2 = nn.BatchNorm1d(256)

        # Final dense layer to reduce to output_dim
        self.fc3 = nn.Linear(256, output_dim)
        self.bn3 = nn.BatchNorm1d(output_dim)

        # Dropout for regularisation and ReLU activation
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
        # 1st convolutional layer
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        # 2nd convolutional layer
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        # 3rd convolutional layer
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)

        # Max pooling and dropout
        self.pool = nn.MaxPool2d(2)
        self.dropout = nn.Dropout(0.3)

        # Flattened size expected after conv + pooling
        self.flattened_size = 128 * 32 * 64
        # Fully connected layer to get 128-dim output
        self.fc = nn.Linear(self.flattened_size, 128)
        # dropout after FC
        self.fc_dropout = nn.Dropout(0.3)  


    def forward(self, x):
        x = F.relu(self.conv1(x))       
        x = self.pool(F.relu(self.conv2(x)))  
        x = self.pool(F.relu(self.conv3(x)))  
        x = self.dropout(x)

        # Flatten to ensure shape compatability 
        x = x.view(x.size(0), -1)     
        x = self.fc(x)  
        #  dropout layer after FC
        x = self.fc_dropout(x)                   
        return x


# Final Fusion Model
class AudioDeepfakeFusionModel(nn.Module):
    def __init__(self):
        super(AudioDeepfakeFusionModel, self).__init__()

        # CNN-based branch for MFCC
        self.mfcc_branch = SiameseMFCCBranch()

        # MLP branches for the remaining 9 features
        self.chroma_branch     = DenseNeuralNetwork(input_dim=128)
        self.tonnetz_branch    = DenseNeuralNetwork(input_dim=128)
        self.contrast_branch   = DenseNeuralNetwork(input_dim=128)
        self.pitch_branch      = DenseNeuralNetwork(input_dim=128)
        self.energy_branch     = DenseNeuralNetwork(input_dim=128)
        self.zcr_branch        = DenseNeuralNetwork(input_dim=128)
        self.onset_branch      = DenseNeuralNetwork(input_dim=128)
        self.centroid_branch   = DenseNeuralNetwork(input_dim=128)
        self.mel_spec_branch   = DenseNeuralNetwork(input_dim=128)

        # Fusion layer that combines all 10 feature vectors into a larger vector
        self.fusion_layer = nn.Sequential(
           
            # Combine all branches
            nn.Linear(10 * 128, 512),  
            #Adding ReLU activation function    
            nn.ReLU(),
            # Adding 0.3 dropout to help prevent overfitting 
            nn.Dropout(0.3),
           
            # Reduce to 256-dim
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
        )

        # Final classifier layer (binary output)
        self.output_layer = nn.Linear(256, 1)

    def forward(self, mfcc, chroma, tonnetz, contrast, pitch, energy, zcr, onset, centroid, mel_spec):

        # MFCC input is 2D, add channel dim for CNN: (B, 1, H, W)
        mfcc = mfcc.unsqueeze(1)  

        # Pooling for time-dimension on all 1D features
        def pool(x): return x.mean(dim=-1)

        # Forward through each branch
        mfcc_out     = self.mfcc_branch(mfcc)
        chroma_out   = self.chroma_branch(pool(chroma))
        tonnetz_out  = self.tonnetz_branch(pool(tonnetz))
        contrast_out = self.contrast_branch(pool(contrast))
        pitch_out    = self.pitch_branch(pool(pitch))
        energy_out   = self.energy_branch(pool(energy))
        zcr_out      = self.zcr_branch(pool(zcr))
        onset_out    = self.onset_branch(pool(onset))
        centroid_out = self.centroid_branch(pool(centroid))
        mel_spec_out = self.mel_spec_branch(pool(mel_spec))

        # Concatenate all feature vectors into one
        fusion = torch.cat([
            mfcc_out, chroma_out, tonnetz_out, contrast_out,
            pitch_out, energy_out, zcr_out, onset_out, centroid_out, mel_spec_out
        ], dim=1)

        # Forward pass through fusion and output layer
        x = self.fusion_layer(fusion)

        # Binary output in range [0, 1]
        return torch.sigmoid(self.output_layer(x))