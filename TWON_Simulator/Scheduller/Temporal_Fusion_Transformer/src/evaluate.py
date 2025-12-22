import torch
import torch.nn.functional as F
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score


def evaluate_model(model, val_loader):
    model.eval()

    raw_preds, y_true = model.predict(
        val_loader,
        mode="raw",
        return_y=True
    )

    logits = raw_preds["prediction"][:, -1, :].cpu()
    targets = y_true[:, -1].cpu()

    preds = torch.argmax(logits, dim=1)

    metrics = {
        "Accuracy": accuracy_score(targets, preds),
        "Macro-F1": f1_score(targets, preds, average="macro"),
        "Micro-F1": f1_score(targets, preds, average="micro"),
        "Precision": precision_score(
            targets, preds, average="macro", zero_division=0
        ),
        "Recall": recall_score(
            targets, preds, average="macro", zero_division=0
        ),
        "NLL": F.cross_entropy(logits, targets).item(),
    }

    metrics["Perplexity"] = float(
        torch.exp(torch.tensor(metrics["NLL"]))
    )

    print("\n📊 Evaluation Results")
    for k, v in metrics.items():
        print(f"{k:20s}: {v:.4f}")

    return metrics
