from pathlib import Path

BASE_DIR = Path("data/schedular_data/technology")

MERGED_JSON = BASE_DIR / "merged_technology_sorted.json"

SEQ_LEN = 10
BATCH_SIZE = 64
EPOCHS = 10
LR = 1e-3

MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)
