from src.config import MERGED_JSON, BASE_DIR
from src.data.build_events import build_event_dataframe
from src.data.encode_features import encode_dataframe
from src.data.build_sequences import build_sequences
from src.train.train_lstm import train_lstm
from src.eval.eval_lstm import evaluate_model_full
import torch


def main():
    df = build_event_dataframe(MERGED_JSON)
    df = encode_dataframe(df, BASE_DIR)
    build_sequences(df, seq_len=10, out_dir=BASE_DIR)

    model, test_loader = train_lstm()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    evaluate_model_full(model, test_loader, device)


if __name__ == "__main__":
    main()
