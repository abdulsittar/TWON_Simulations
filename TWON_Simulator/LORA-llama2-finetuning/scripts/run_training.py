import argparse
from src.config import TrainingConfig
from src.data import load_and_split_dataset, tokenize_example
from src.model import load_model_and_tokenizer, apply_lora
from src.train import train_model
from src.utils import find_latest_checkpoint

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default=None)
    parser.add_argument("--epochs", type=int, default=None)
    args = parser.parse_args()

    config = TrainingConfig()
    if args.data:
        config.dataset_path = args.data
    if args.epochs:
        config.num_epochs = args.epochs

    model, tokenizer = load_model_and_tokenizer(config.model_name)
    model = apply_lora(model)

    train_ds, eval_ds = load_and_split_dataset(config.dataset_path)

    train_ds = train_ds.map(lambda x: tokenize_example(x, tokenizer, config.max_length))
    eval_ds = eval_ds.map(lambda x: tokenize_example(x, tokenizer, config.max_length))

    checkpoint = find_latest_checkpoint(config.output_dir)

    train_model(model, tokenizer, train_ds, eval_ds, config, checkpoint)

if __name__ == "__main__":
    main()
