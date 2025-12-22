import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder


def clean(series):
    return series.replace("", "unknown").fillna("unknown").astype(str)


def encode_dataframe(df: pd.DataFrame, out_dir):
    df["target_user"] = clean(df["target_user"])
    df["target_post"] = clean(df["target_post"])
    df["topic_id"] = clean(df["topic_id"])
    df["action_type"] = clean(df["action_type"])

    # Action
    action_encoder = LabelEncoder()
    df["action_type_encoded"] = action_encoder.fit_transform(df["action_type"])
    np.save(out_dir / "action_encoder.npy", action_encoder)

    # Users (actor + target)
    users = pd.concat([df["actor_user"], df["target_user"]])
    user_encoder = LabelEncoder().fit(users)
    df["actor_user_encoded"] = user_encoder.transform(df["actor_user"])
    df["target_user_encoded"] = user_encoder.transform(df["target_user"])
    np.save(out_dir / "user_encoder.npy", user_encoder)

    # Post
    post_encoder = LabelEncoder()
    df["target_post_encoded"] = post_encoder.fit_transform(df["target_post"])
    np.save(out_dir / "post_encoder.npy", post_encoder)

    # Topic
    topic_encoder = LabelEncoder()
    df["topic_encoded"] = topic_encoder.fit_transform(df["topic_id"])
    np.save(out_dir / "topic_encoder.npy", topic_encoder)

    return df
