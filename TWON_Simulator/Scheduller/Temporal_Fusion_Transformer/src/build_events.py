from datetime import datetime
import pandas as pd

def build_event_dataframe(merged_data):
    records = []
    last_event_time_user = {}

    for e in merged_data:
        if e["source"] == "reddit":
            post_dt = datetime.strptime(e["datetime"], "%Y-%m-%dT%H:%M:%SZ")
            actor = e.get("author")

            last = last_event_time_user.get(actor)
            delta = (post_dt - last).total_seconds() / 3600 if last else 0
            last_event_time_user[actor] = post_dt

            records.append({
                "datetime": post_dt,
                "actor_user": actor,
                "action_type": "post",
                "target_user": "",
                "target_post": e.get("id", ""),
                "topic_id": e.get("topic_id", -1),
                "hour": post_dt.hour,
                "day_of_week": post_dt.weekday(),
                "month": post_dt.month,
                "time_since_last_user_event": delta
            })

            for c in e.get("comments", []):
                c_dt = datetime.utcfromtimestamp(c["created_utc"])
                c_actor = c["author"]

                last = last_event_time_user.get(c_actor)
                delta = (c_dt - last).total_seconds() / 3600 if last else 0
                last_event_time_user[c_actor] = c_dt

                records.append({
                    "datetime": c_dt,
                    "actor_user": c_actor,
                    "action_type": "comment",
                    "target_user": actor,
                    "target_post": e.get("id", ""),
                    "topic_id": c.get("topic_id", -1),
                    "hour": c_dt.hour,
                    "day_of_week": c_dt.weekday(),
                    "month": c_dt.month,
                    "time_since_last_user_event": delta
                })

    return pd.DataFrame(records)
