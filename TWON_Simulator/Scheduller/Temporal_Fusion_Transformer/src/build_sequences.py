import numpy as np

def build_sequences(df, feature_cols, seq_len):
    X, y = [], []

    for i in range(len(df) - seq_len):
        X.append(df[feature_cols].iloc[i:i+seq_len].values)
        y.append(df["action_type_encoded"].iloc[i+seq_len])

    return np.array(X, dtype=np.float32), np.array(y)
