import pandas as pd
import numpy as np
from pytorch_forecasting import TimeSeriesDataSet

COLUMNS = [
    "actor_user_encoded",
    "target_user_encoded",
    "target_post_encoded",
    "topic_encoded",
    "hour",
    "day_of_week",
    "month",
    "time_since_last_user_event"
]

def sequence_to_df(sequence_np):
    df = pd.DataFrame(sequence_np, columns=COLUMNS)
    df["time_idx"] = np.arange(len(df))
    df["sample_id"] = 0

    for col in COLUMNS[:-1]:
        df[col] = df[col].astype(str)

    return df

def build_inference_dataset(df, target_col):
    return TimeSeriesDataSet(
        df,
        time_idx="time_idx",
        target=target_col,
        group_ids=["sample_id"],
        max_encoder_length=len(df) - 1,
        max_prediction_length=1,
        static_categoricals=["actor_user_encoded"],
        time_varying_known_categoricals=["hour", "day_of_week", "month"],
        time_varying_unknown_categoricals=[
            "target_user_encoded",
            "target_post_encoded",
            "topic_encoded"
        ],
        add_relative_time_idx=True,
        allow_missing_timesteps=True
    )
