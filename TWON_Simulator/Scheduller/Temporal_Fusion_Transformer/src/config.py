from pathlib import Path

BASE_PATH = Path("data/schedular_data/technology")

MERGED_JSON = BASE_PATH / "merged_technology_sorted.json"

SEQ_LEN = 10
BATCH_SIZE = 64
MAX_EPOCHS = 10

MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)
