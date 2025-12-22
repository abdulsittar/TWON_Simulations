# TWON - Large Scale Simulations

A hybrid TypeScript/Python application for running and analyzing large-scale social media simulations using ML-powered agent schedulers and fine-tuned LLM agents. This platform enables researchers and developers to study agent behaviors, interaction patterns, and emergent phenomena in controlled social media environments with realistic, data-driven behavior patterns.

## 🌟 Features

### Core Simulation Framework
- **Multi-Agent Simulation**: Setup and run simulations with multiple LLM agents interacting in a social media environment
- **Flexible Configuration**: Choose different language models, platforms, and topics for your simulations
- **Agent Lifecycle Management**: Monitor and manage agent states, interactions, and resource usage
- **Real-Time Analytics**: Track key metrics including:
  - Total Time & Used Time per agent
  - Replenish Rates
  - Interaction metrics (Posts, Likes, Dislikes, Comments)
  - Custom Debate Quality Metrics
- **Dark Mode Interface**: Clean, modern UI with dark mode for better visibility

### 🤖 ML-Powered Intelligence
- **Data-Driven Schedulers**: LSTM and Temporal Fusion Transformer (TFT) models trained on real Reddit data to predict realistic agent interaction patterns
- **Fine-tuned LLMs**: LoRA-based fine-tuning of Llama 2 models for domain-specific content generation
- **RAG System**: Retrieval-Augmented Generation using FAISS and Sentence-BERT for contextually grounded responses
- **Multi-Topic Support**: Pre-trained models for COVID, Climate Change, and Technology debates
- **Hybrid Architecture**: Combines ML-predicted scheduling (WHEN/WHO) with LLM-generated content (WHAT)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TypeScript 4.x

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abdulsittar/TWON_Simulations.git
cd TWON_Simulations
```

2. Set up your environment variables in the .env file that you will create dircetly in the TWON_Simulations repository:
```bash
NODE_ENV=
MONGO_URI=
JWT_SECRET=
PORT=
```

## 🧠 ML Models Integration

The platform uses a hybrid architecture combining machine learning schedulers with large language models:

### How It Works

1. **Data Collection** (`TWON_Simulator/Data_Collection/`)
   - Real Reddit posts and comments are collected across different topics
   - Data includes timestamps, user interactions, and content
   - Organized by topic: COVID, Climate, Technology

2. **Scheduler Training** (`TWON_Simulator/Scheduller/`)
   - **LSTM Model**: Multi-task LSTM predicts 5 outputs simultaneously:
     - Who acts next (actor user)
     - What action they take (post/comment)
     - Who they interact with (target user)
     - Which post they interact with
     - What topic they discuss
   - **TFT Model**: Temporal Fusion Transformer with attention mechanisms for better long-range pattern capture
   - Both models learn realistic timing and interaction patterns from real data

3. **LLM Fine-tuning** (`TWON_Simulator/LORA-llama2-finetuning/`)
   - Fine-tune Llama 2 (7B) using LoRA (Low-Rank Adaptation)
   - Memory-efficient training with 8-bit quantization
   - Adapts base models to specific debate styles and topics
   - Generates contextually appropriate responses

4. **RAG System** (`TWON_Simulator/server/rag/`)
   - FAISS vector database stores embeddings of real posts/comments
   - Sentence-BERT generates semantic embeddings
   - Retrieves relevant context for each generated action
   - Grounds LLM responses in realistic examples

5. **Real-time Inference** (`TWON_Simulator/server/`)
   - FastAPI server with WebSocket support
   - Loads trained scheduler models (LSTM or TFT)
   - Predicts next agent action based on event history
   - Generates content using RAG + fine-tuned LLM
   - Streams events to TypeScript backend in real-time

### Integration with Backend

The ML inference server communicates with the TypeScript backend via:
- **REST API**: Status checks, configuration
- **WebSockets**: Real-time event streaming
- **Shared Database**: MongoDB stores generated interactions

This architecture enables:
- ✅ **Realistic timing**: Actions follow learned temporal patterns
- ✅ **Authentic interactions**: Based on real social media behavior
- ✅ **Scalable generation**: Predict thousands of events efficiently
- ✅ **Contextual content**: Grounded in real examples via RAG
- ✅ **Topic specificity**: Models trained per debate domain

## 🏗️ Project Structure

The project consists of three main components working together:

### 1. **Frontend** (TypeScript/React)
User interface for configuring and monitoring simulations with real-time analytics and visualizations.

### 2. **Backend** (TypeScript/Node.js)
Core simulation engine managing agent lifecycles, interactions, and data persistence.

### 3. **TWON_Simulator** (Python/ML)
Machine learning infrastructure for intelligent agent scheduling and content generation.

```
twon-simulations/
├── backend/                          # TypeScript simulation engine
│   ├── Dockerfile
│   ├── src/
│   │   ├── app.ts
│   │   ├── config/                   # Database & environment config
│   │   ├── controllers/              # API endpoints
│   │   ├── models/                   # Data models
│   │   │   ├── content/              # Posts, comments, likes
│   │   │   ├── platform/             # Platform configurations
│   │   │   ├── shared/               # Shared utilities
│   │   │   └── user/                 # User/agent models
│   │   ├── routes/                   # API routes
│   │   ├── services/                 # Business logic
│   │   │   ├── simulation_KIT.ts     # KIT simulation mode
│   │   │   ├── simulation_TRIER.ts   # TRIER simulation mode
│   │   │   ├── agent_Actions_*.ts    # Agent behavior logic
│   │   │   └── network.ts            # Social network graph
│   │   └── utils/                    # Helper functions
│   └── tsconfig.json
│
├── frontend/                         # React user interface
│   ├── Dockerfile
│   ├── src/
│   │   ├── api/                      # API client
│   │   ├── components/               # React components
│   │   │   ├── charts/               # Analytics visualizations
│   │   │   ├── menu/                 # Navigation
│   │   │   └── DataTable.tsx         # Data display
│   │   ├── contexts/                 # React contexts
│   │   ├── pages/                    # Main pages
│   │   └── services/                 # Frontend services
│   └── vite.config.ts
│
├── TWON_Simulator/                   # 🤖 ML Infrastructure (NEW)
│   ├── Data_Collection/              # Training data storage
│   │   ├── COVID/                    # COVID-19 debate data
│   │   ├── Climate/                  # Climate change data
│   │   └── Technology/               # Technology debate data
│   │
│   ├── LORA-llama2-finetuning/       # LLM fine-tuning
│   │   ├── scripts/
│   │   │   └── run_training.py       # Training orchestration
│   │   └── src/
│   │       ├── config.py             # Model & training config
│   │       ├── data.py               # Dataset loading
│   │       ├── model.py              # LoRA model setup
│   │       ├── train.py              # Training loop
│   │       └── utils.py              # Checkpoint management
│   │
│   ├── Scheduller/                   # Agent action prediction
│   │   ├── LSTM/                     # LSTM-based scheduler
│   │   │   └── src/
│   │   │       ├── config.py         # LSTM configuration
│   │   │       ├── data/             # Event processing
│   │   │       │   ├── build_events.py
│   │   │       │   ├── encode_features.py
│   │   │       │   └── build_sequences.py
│   │   │       ├── datasets/         # PyTorch datasets
│   │   │       ├── models/           # Multi-task LSTM
│   │   │       ├── train/            # Training logic
│   │   │       └── eval/             # Evaluation metrics
│   │   │
│   │   └── Temporal_Fusion_Transformer/  # TFT-based scheduler
│   │       └── src/
│   │           ├── config.py         # TFT configuration
│   │           ├── build_events.py   # Event extraction
│   │           ├── encode_features.py
│   │           ├── train_tft.py      # TFT training
│   │           └── evaluate.py       # Model evaluation
│   │
│   └── server/                       # ML inference server
│       ├── main.py                   # FastAPI + SocketIO
│       ├── api/
│       │   ├── routes.py             # REST endpoints
│       │   └── socket.py             # WebSocket handlers
│       ├── models/
│       │   ├── tft_loader.py         # TFT model loading
│       │   └── inference.py          # Prediction logic
│       ├── rag/
│       │   ├── faiss_index.py        # Vector database
│       │   └── generation.py         # RAG pipeline
│       ├── data/
│       │   └── sequence_utils.py     # Sequence processing
│       └── simulation/
│           └── scheduler.py          # Event generation loop
│
├── docker-compose.yml                # Multi-container orchestration
├── LICENSE
└── README.md
```

## 🎮 Usage

### Running the Simulation Platform

1. Build and start the server:
```bash
# Run this command in the terminal:
podman-compose up --build
```
2. Access the application at the link that pops up after the app had successfully run.

### Training ML Models (Optional)

If you want to train your own scheduler models or fine-tune LLMs:

#### 1. Train Scheduler Models
```bash
# LSTM-based scheduler
cd TWON_Simulator/Scheduller/LSTM
python -m src.main

# Or TFT-based scheduler
cd TWON_Simulator/Scheduller/Temporal_Fusion_Transformer
python -m src.main
```

#### 2. Fine-tune Llama 2 with LoRA
```bash
cd TWON_Simulator/LORA-llama2-finetuning
python scripts/run_training.py --data path/to/dataset.json --epochs 3
```

#### 3. Start ML Inference Server
```bash
cd TWON_Simulator/server
python main.py
```

**Note**: Pre-trained models are included, so you can run simulations without training from scratch.

### Running a Simulation

1. The app will open directly to the simulation page
![Simulation Configuration](images/simulation_setup.png)
2. Configure your simulation parameters:
   - Select a language model
   - Choose the platform to run it on
   - Define the simulation topic
   - Add any additional parameters
4. Click "Run" to start the simulation

## 📊 Metrics and Analysis

The platform provides several key metrics for analysis:
![Simulation Configuration](images/metrics1.png)
![Simulation Configuration](images/metrics2.png)
- **Agent Lifecycle**: Monitor agent activity and resource usage
- **Generated Data**: Track social interactions (posts, likes, dislikes, comments)
- **Debate Quality**: Analyze interaction quality through custom metrics
- **Time Usage**: Monitor total and used time for each agent

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Chart.js** / **Recharts** for visualizations

### Backend
- **Node.js** with TypeScript
- **Express.js** for API
- **MongoDB** for data persistence
- **JWT** for authentication

### ML Infrastructure
- **PyTorch** for deep learning models
- **PyTorch Forecasting** (TFT implementation)
- **Transformers** (Hugging Face) for LLMs
- **PEFT** (Parameter-Efficient Fine-Tuning) for LoRA
- **FAISS** for vector similarity search
- **Sentence-Transformers** for embeddings
- **FastAPI** for ML API server
- **SocketIO** for real-time communication

### DevOps
- **Docker** / **Podman** for containerization
- **Docker Compose** for orchestration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who participate in this project
- Built with TypeScript and React
- Powered by large language models for agent simulation

---

For more information or support, please open an issue on the GitHub repository.