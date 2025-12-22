from src.train_tft import train_or_load_model
from src.evaluate import evaluate_model
from src.data import load_dataset  # your existing dataset builder

def main():
    dataset = load_dataset()
    model, val_loader = train_or_load_model(dataset)
    evaluate_model(model, val_loader)

if __name__ == "__main__":
    main()
