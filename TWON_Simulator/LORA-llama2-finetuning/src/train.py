from transformers import Trainer, TrainingArguments, DataCollatorForSeq2Seq, EarlyStoppingCallback

def train_model(
    model,
    tokenizer,
    train_dataset,
    eval_dataset,
    config,
    checkpoint_dir=None
):
    args = TrainingArguments(
        output_dir=config.output_dir,
        per_device_train_batch_size=config.batch_size,
        gradient_accumulation_steps=config.grad_accumulation,
        learning_rate=config.learning_rate,
        num_train_epochs=config.num_epochs,
        warmup_steps=config.warmup_steps,
        evaluation_strategy="steps",
        eval_steps=config.eval_steps,
        save_steps=config.save_steps,
        save_total_limit=5,
        fp16=True,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        report_to="tensorboard",
    )

    data_collator = DataCollatorForSeq2Seq(
        tokenizer,
        pad_to_multiple_of=8,
        return_tensors="pt"
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
        callbacks=[EarlyStoppingCallback(
            early_stopping_patience=config.early_stopping_patience
        )],
    )

    trainer.train(resume_from_checkpoint=checkpoint_dir)
    trainer.save_model(config.output_dir)

    return trainer
