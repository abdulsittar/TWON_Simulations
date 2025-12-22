import numpy as np
from sklearn.preprocessing import LabelEncoder

def clean(series):
    return series.replace("", "unknown").fillna("unknown").astype(str)

def encode_dataframe(df, save_dir):
    df["target_user"] = clean(df["target_user"])
    df["target_post"] = clean(df["target_post"])
    df["topic_id"] = clean(df["topic_id"])
    df["action_type"] = clean(df["action_type"])

    encoders = {}

    for col in ["action_type", "target_post", "topic_id"]:
        le = LabelEncoder()
        df[f"{col}_encoded"] = le.fit_transform(df[col])
        np.save(save_dir / f"{col}_encoder.npy", le)
        encoders[col] = le

    return df, encoders
