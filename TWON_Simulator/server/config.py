import torch

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MONGO_URI = "mongodb+srv://<user>:<pass>@cluster0.mongodb.net/climate_ai"
DB_NAME = "climate_ai"
COLLECTION_NAME = "generated_actions"

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
LLM_MODEL = "google/flan-t5-base"

FAISS_DATA_PATH = "data/technology_topics_final.json"
LAST_SEQUENCE_PATH = "data/last_sequence.npy"
