import os
import json

def find_latest_checkpoint(output_dir):
    if not os.path.exists(output_dir):
        return None

    checkpoints = [
        d for d in os.listdir(output_dir)
        if d.startswith("checkpoint-")
    ]

    if not checkpoints:
        return None

    checkpoints.sort(key=lambda x: int(x.split("-")[1]))
    return os.path.join(output_dir, checkpoints[-1])


def save_json(obj, path):
    with open(path, "w") as f:
        json.dump(obj, f, indent=2)
