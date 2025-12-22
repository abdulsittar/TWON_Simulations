import os
import torch
import lightning.pytorch as pl
from pytorch_forecasting import TemporalFusionTransformer
from pytorch_forecasting.metrics import CrossEntropy
from torchmetrics.classification import Accuracy

from .config import (
    BATCH_SIZE, MAX_EPOCHS, LEARNING_RATE,
    CKPT_PATH, TARGET
)


def train_or_load_model(dataset):
    train_loader = dataset.to_dataloader(
        train=True, batch_size=BATCH_SIZE
    )
    val_loader = dataset.to_dataloader(
        train=False, batch_size=BATCH_SIZE
    )

    num_classes = dataset.data[TARGET].nunique()

    if os.path.exists(CKPT_PATH):
        print(f"🔁 Loading model from {CKPT_PATH}")
        model = TemporalFusionTransformer.load_from_checkpoint(
            CKPT_PATH,
            map_location="cpu",
            weights_only=False
        )
    else:
        print("🚀 Training new TFT model")

        model = TemporalFusionTransformer.from_dataset(
            dataset,
            hidden_size=64,
            attention_head_size=4,
            dropout=0.1,
            hidden_continuous_size=16,
            output_size=num_classes,
            loss=CrossEntropy(),
            logging_metrics=[
                Accuracy(task="multiclass", num_classes=num_classes)
            ],
            learning_rate=LEARNING_RATE
        )

        trainer = pl.Trainer(
            max_epochs=MAX_EPOCHS,
            accelerator="gpu" if torch.cuda.is_available() else "cpu",
            enable_checkpointing=False
        )

        trainer.fit(model, train_loader, val_loader)
        trainer.save_checkpoint(CKPT_PATH)

        print(f"✅ Model saved to {CKPT_PATH}")

    return model, val_loader
