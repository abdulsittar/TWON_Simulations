import torch

def predict_next_class(tft_model, dataset):
    loader = dataset.to_dataloader(train=False, batch_size=1)
    raw = tft_model.predict(loader, mode="raw")
    logits = raw["prediction"][:, -1, :]
    probs = torch.softmax(logits, dim=1)
    return torch.multinomial(probs, 1).item()
