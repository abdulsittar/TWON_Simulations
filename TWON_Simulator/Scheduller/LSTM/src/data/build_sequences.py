import numpy as np


def build_sequences(df, seq_len, out_dir):
    features = [
        "actor_user_encoded",
        "target_user_encoded",
        "target_post_encoded",
        "topic_encoded",
        "hour",
        "day_of_week",
        "month",
        "time_since_last_user_event"
    ]

    X, y_actor, y_action, y_user, y_post, y_topic = [], [], [], [], [], []

    for i in range(len(df) - seq_len):
        X.append(df[features].iloc[i:i+seq_len].values.astype("float32"))
        y_actor.append(df["actor_user_encoded"].iloc[i+seq_len])
        y_action.append(df["action_type_encoded"].iloc[i+seq_len])
        y_user.append(df["target_user_encoded"].iloc[i+seq_len])
        y_post.append(df["target_post_encoded"].iloc[i+seq_len])
        y_topic.append(df["topic_encoded"].iloc[i+seq_len])

    X = np.array(X)
    y_actor = np.array(y_actor)
    y_action = np.array(y_action)
    y_user = np.array(y_user)
    y_post = np.array(y_post)
    y_topic = np.array(y_topic)

    np.save(out_dir / "X_sequences.npy", X)
    np.save(out_dir / "y_actor_user.npy", y_actor)
    np.save(out_dir / "y_action.npy", y_action)
    np.save(out_dir / "y_target_user.npy", y_user)
    np.save(out_dir / "y_target_post.npy", y_post)
    np.save(out_dir / "y_topic.npy", y_topic)

    return X, y_actor, y_action, y_user, y_post, y_topic
