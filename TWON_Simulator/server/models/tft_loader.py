import torch
import numpy as np
import pytorch_forecasting
from pytorch_forecasting import TemporalFusionTransformer
from server.config import DEVICE

torch.serialization.add_safe_globals([
    pytorch_forecasting.data.encoders.NaNLabelEncoder,
    np.dtype,
    np.core.multiarray.scalar
])

def load_tft(path: str):
    model = TemporalFusionTransformer.load_from_checkpoint(
        path,
        map_location=DEVICE,
        weights_only=False
    )
    model.eval()
    return model
