import torch
import torch.nn.functional as F
from sklearn.metrics import f1_score


def evaluate_model_full(model, loader, device):
    model.eval()
    all_true, all_pred = [], []

    with torch.no_grad():
        for X, _, y_action, *_ in loader:
            X, y_action = X.to(device), y_action.to(device)
            _, out, *_ = model(X)
            preds = torch.argmax(out, dim=1)
            all_true.extend(y_action.cpu().numpy())
            all_pred.extend(preds.cpu().numpy())

    print("Macro-F1:", f1_score(all_true, all_pred, average="macro"))
