import torch
from torch.utils.data import Dataset


class SequenceDatasetMultiTask(Dataset):
    def __init__(self, X, y_actor, y_action, y_user, y_post, y_topic):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y_actor = torch.tensor(y_actor, dtype=torch.long)
        self.y_action = torch.tensor(y_action, dtype=torch.long)
        self.y_user = torch.tensor(y_user, dtype=torch.long)
        self.y_post = torch.tensor(y_post, dtype=torch.long)
        self.y_topic = torch.tensor(y_topic, dtype=torch.long)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return (
            self.X[idx],
            self.y_actor[idx],
            self.y_action[idx],
            self.y_user[idx],
            self.y_post[idx],
            self.y_topic[idx]
        )
