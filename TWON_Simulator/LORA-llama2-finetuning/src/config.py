from dataclasses import dataclass

@dataclass
class TrainingConfig:
    model_name: str = "meta-llama/Llama-2-7b-chat-hf"
    dataset_path: str = ""
    output_dir: str = "outputs/lora_llama2"

    max_length: int = 512
    train_split: float = 0.9

    batch_size: int = 2
    grad_accumulation: int = 16
    learning_rate: float = 2e-4
    num_epochs: int = 3

    eval_steps: int = 200
    save_steps: int = 200
    warmup_steps: int = 100
    early_stopping_patience: int = 5
