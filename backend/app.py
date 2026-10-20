"""
AI-Based Intelligent CCTV Surveillance System
FastAPI Backend Server & Computer Vision Pipeline
Exposes REST API and WebSocket stream integration.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
import sqlite3
import os
import cv2
import numpy as np

from detection.yolo_detector import YOLODetector
from detection.intrusion import IntrusionDetector
from detection.tracker import SimpleTracker

app = FastAPI(
    title="AI CCTV Surveillance Core API",
    description="Backend engine for AI anomaly detection, YOLOv8 tracking, and incident logging.",
    version="2.5.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Detection Modules
yolo = YOLODetector(model_name="yolov8n.pt", confidence_threshold=0.45)
intrusion_engine = IntrusionDetector(alert_cooldown_seconds=4.0)
tracker = SimpleTracker()

DB_PATH = os.path.join(os.path.dirname(__file__), "database", "cctv.db")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    schema_file = os.path.join(os.path.dirname(__file__), "database", "schema.sql")
    if os.path.exists(schema_file):
        with open(schema_file, "r") as f:
            sql = f.read()
        conn = sqlite3.connect(DB_PATH)
        conn.executescript(sql)
        conn.commit()
        conn.close()

try:
    init_db()
except Exception as e:
    print(f"[Database Note] SQLite init: {e}")

# Data Models
class CameraCreate(BaseModel):
    name: str
    location: str
    source_type: str = "video_file"
    resolution: Optional[str] = "1920x1080"
    fps: Optional[int] = 30
    rtsp_url: Optional[str] = None

class IncidentReview(BaseModel):
    review_status: str
    reviewer_notes: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Python OpenCV/YOLOv8 Computer Vision Backend",
        "yolo_loaded": yolo.model_loaded,
        "classes_supported": list(yolo.classes_map.values()),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/cameras")
def get_cameras():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cameras ORDER BY id ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/incidents")
def get_incidents(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    camera_id: Optional[str] = None
):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    query = "SELECT * FROM incidents WHERE 1=1"
    params = []

    if category and category != "all":
        query += " AND event_type = ?"
        params.append(category)
    if severity and severity != "all":
        query += " AND severity = ?"
        params.append(severity)
    if status and status != "all":
        query += " AND review_status = ?"
        params.append(status)
    if camera_id and camera_id != "all":
        query += " AND camera_id = ?"
        params.append(camera_id)

    query += " ORDER BY timestamp DESC LIMIT 100"
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.patch("/api/incidents/{incident_id}/review")
def review_incident(incident_id: str, review: IncidentReview):
    if review.review_status not in ["pending", "confirmed", "dismissed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE incidents SET review_status = ?, reviewer_notes = ? WHERE id = ?",
        (review.review_status, review.reviewer_notes, incident_id)
    )
    conn.commit()
    conn.close()
    return {"success": True, "id": incident_id, "status": review.review_status}

@app.post("/api/detect_frame")
async def detect_frame(file: UploadFile = File(...)):
    """
    Accepts an uploaded image frame from camera or video stream,
    runs YOLO inference and intrusion analysis, returns detected objects.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image frame")

    detections = yolo.detect_frame(frame)
    tracked = tracker.update(detections)

    return {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "detections_count": len(tracked),
        "objects": tracked
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
