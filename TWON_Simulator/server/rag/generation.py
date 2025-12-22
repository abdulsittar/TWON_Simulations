import requests

def generate_with_rag(task, index, texts, embed_model, llm_fn):
    query = f"{task['who']} talks to {task['to_whom']} about {task['about_what']}"
    q_emb = embed_model.encode([query])
    _, I = index.search(q_emb, k=3)
    context = " ".join(texts[i] for i in I[0])
    return llm_fn(task, context)
