import json
import faiss
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer
from server.config import EMBEDDING_MODEL, FAISS_DATA_PATH

def load_faiss():
    with open(FAISS_DATA_PATH) as f:
        data = json.load(f)

    texts = []
    for post in data:
        texts.append(post["title"] + " " + post["selftext"])
        for c in post.get("comments", []):
            texts.append(c["body"])

    model = SentenceTransformer(EMBEDDING_MODEL)

    if Path("data/covid_embeddings.npy").exists():
        embeddings = np.load("data/covid_embeddings.npy")
    else:
        embeddings = model.encode(texts, convert_to_numpy=True)
        np.save("data/covid_embeddings.npy", embeddings)

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    return index, texts, model
