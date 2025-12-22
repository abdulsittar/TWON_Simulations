from datasets import load_dataset

def load_and_split_dataset(path, split_ratio=0.9, seed=42):
    dataset = load_dataset("json", data_files={"train": path})["train"]
    dataset = dataset.train_test_split(
        test_size=1 - split_ratio,
        seed=seed
    )
    return dataset["train"], dataset["test"]


def tokenize_example(example, tokenizer, max_length):
    text = (
        f"### Instruction:\n{example['instruction']}\n"
        f"### Input:\n{example['input']}\n"
        f"### Output:\n{example['output']}"
    )

    tokenized = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=max_length
    )

    tokenized["labels"] = [
        t if t != tokenizer.pad_token_id else -100
        for t in tokenized["input_ids"]
    ]
    return tokenized
