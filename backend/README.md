# AI-Based Intelligent CCTV Surveillance System - Python Computer Vision Backend

This directory contains the standalone Python OpenCV, YOLOv8, and SQLite backend for real-time video processing, object tracking, and incident logging.

## Prerequisites

- Python 3.10+
- Webcam or RTSP camera streams or sample surveillance video files
- CUDA-compatible GPU (Optional for accelerated YOLO inference; CPU inference supported automatically)

## Local Setup in Visual Studio Code / Terminal

### 1. Create a Python Virtual Environment

```bash
cd backend
python -m venv venv

# On Linux / macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Required Dependencies

```bash
pip install -r requirements.txt
```

### 3. Initialize the SQLite Database

```bash
python -c "import sqlite3; conn = sqlite3.connect('database/cctv.db'); conn.executescript(open('database/schema.sql').read()); conn.close(); print('Database initialized.')"
```

### 4. Start the FastAPI Computer Vision Backend Server

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The Python API will be available at:
- **API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

### 5. Connecting with the React Security Operations Dashboard

In the web interface:
1. Open the **System Health & Config** panel or **Video Monitoring** view.
2. Under "Detection Engine Status", toggle between the **Built-in Browser Engine** and the **External Python Backend** (`http://localhost:8000`).
3. When the Python backend is detected, live frames will be sent to YOLOv8 for inference and ByteTrack tracking.

---

## AI Detection Modules Status Matrix

| Module | Name | Status | Model / Algorithm | Requirements |
|---|---|---|---|---|
| **Module A** | Person & Vehicle Detection | **ACTIVE** | YOLOv8n (COCO) | Detects persons, cars, trucks, bicycles, buses |
| **Module B** | Restricted-Area Intrusion | **ACTIVE** | Ray-Casting Polygon Crossing | User-drawn polygon zones on live feeds |
| **Module C** | Physical Altercation Detection | **NOT CONFIGURED** | VideoMAE / Action Transformer | Requires temporal sequence action model & training dataset |
| **Module D** | Theft-Related Event Review | **CONFIGURED** | ByteTrack Proximity Rules | Detachment & dwell heuristics; flags for human review |
| **Module E** | Vehicle Incident Detection | **CONFIGURED** | Trajectory Vector Analyzer | Wrong-way, collision, sudden deceleration alerts |
| **Module F** | Weapon-Like Object Detection | **NOT CONFIGURED** | Specialized YOLO Security Weights | High-risk false positives; requires verified weights |
| **Module G** | Crowd Monitoring | **ACTIVE** | Density Centroid Cluster Estimator | Real-time headcount and density alerts |
| **Module H** | Fire and Smoke Detection | **NOT CONFIGURED** | Optical Flame/Smoke Model | Dedicated thermal or optical flame dataset |
| **Module I** | Abandoned-Object Detection | **ACTIVE** | Stationary Temporal Tracker | Luggage/backpack unattended timer threshold |
| **Module J** | Safety Equipment (PPE) | **CONFIGURED** | YOLOv8-PPE | Hardhat and reflective vest detection |
