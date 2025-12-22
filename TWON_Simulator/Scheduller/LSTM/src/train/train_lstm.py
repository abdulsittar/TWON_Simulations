import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from tqdm import tqdm

from src.datasets.sequence_dataset import SequenceDatasetMultiTask
from src.models.lstm_multitask import SchedulerLSTMMultiTask
from src.config import BASE_DIR, BATCH_SIZE, EPOCHS, LR

class SchedulerLSTMMultiTask(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers,
                 n_actor, n_action, n_user, n_post, n_topic):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size, hidden_size,
            num_layers, batch_first=True
        )

        self.fc_actor = nn.Linear(hidden_size, n_actor)
        self.fc_action = nn.Linear(hidden_size, n_action)
        self.fc_user = nn.Linear(hidden_size, n_user)
        self.fc_post = nn.Linear(hidden_size, n_post)
        self.fc_topic = nn.Linear(hidden_size, n_topic)

    def forward(self, x):
        out, _ = self.lstm(x)
        h = out[:, -1]
        return (
            self.fc_actor(h),
            self.fc_action(h),
            self.fc_user(h),
            self.fc_post(h),
            self.fc_topic(h),
        )

def train_lstm():
    X = np.load(BASE_DIR / "X_sequences.npy")
    y_actor = np.load(BASE_DIR / "y_actor_user.npy")
    y_action = np.load(BASE_DIR / "y_action.npy")
    y_user = np.load(BASE_DIR / "y_target_user.npy")
    y_post = np.load(BASE_DIR / "y_target_post.npy")
    y_topic = np.load(BASE_DIR / "y_topic.npy")

    dataset = SequenceDatasetMultiTask(X, y_actor, y_action, y_user, y_post, y_topic)

    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size
    train_ds, test_ds = random_split(dataset, [train_size, test_size])

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = SchedulerLSTMMultiTask(
        input_size=X.shape[2],
        hidden_size=128,
        num_layers=2,
        n_actor=int(y_actor.max()) + 1,
        n_action=int(y_action.max()) + 1,
        n_user=int(y_user.max()) + 1,
        n_post=int(y_post.max()) + 1,
        n_topic=int(y_topic.max()) + 1,
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(EPOCHS):
        model.train()
        total = 0
        for batch in tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}"):
            batch = [b.to(device) for b in batch]
            Xb, ya, yac, yu, yp, yt = batch

            out = model(Xb)
            loss = sum(criterion(o, y) for o, y in zip(out, [ya, yac, yu, yp, yt]))

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total += loss.item()

        print(f"Epoch {epoch+1} | Loss: {total/len(train_loader):.4f}")

    torch.save(model.state_dict(), "models/scheduler_lstm_multitask.pt")
    return model, test_loader
