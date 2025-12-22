import numpy as np

def compute_perplexity(eval_loss):
    return float(np.exp(eval_loss)) if eval_loss is not None else None
