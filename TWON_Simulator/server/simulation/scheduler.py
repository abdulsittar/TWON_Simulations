import random
from datetime import datetime, timedelta
import torch
from server.data.sequence_utils import sequence_to_df, build_inference_dataset
from server.models.inference import predict_next_class
from server.state import simulation_running, simulation_stats, generated_events

async def run_simulation(
    num_events,
    sequence,
    models,
    encoders,
    rag_fn,
    socket_emit
):
    simulation_stats["start_time"] = int(datetime.now().timestamp())

    for _ in range(num_events):
        if not simulation_running:
            break

        df = sequence_to_df(sequence[0].cpu().numpy())

        action_idx = predict_next_class(models["action"], build_inference_dataset(df, "action_type_encoded"))
        user_idx   = predict_next_class(models["user"], build_inference_dataset(df, "target_user_encoded"))
        post_idx   = predict_next_class(models["post"], build_inference_dataset(df, "target_post_encoded"))
        topic_idx  = predict_next_class(models["topic"], build_inference_dataset(df, "topic_encoded"))

        action = encoders["action"].inverse_transform([action_idx])[0]
        target_user = encoders["user"].inverse_transform([user_idx])[0]
        target_post = encoders["post"].inverse_transform([post_idx])[0]
        topic = encoders["topic"].inverse_transform([topic_idx])[0]

        last_dt = datetime.now() + timedelta(minutes=random.randint(5,120))

        task = {
            "who": encoders["user"].inverse_transform([int(sequence[0,-1,1])])[0],
            "to_whom": target_user,
            "about_what": topic,
            "on_post": target_post,
            "action_type": action,
            "when": last_dt.isoformat() + "Z"
        }

        task["generated_message"] = rag_fn(task)
        generated_events.append(task)
        await socket_emit(task)
