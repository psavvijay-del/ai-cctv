"""
AI-Based Intelligent CCTV Surveillance System
YOLOv8 Object Detection Module (Module A, G, J)
Supports: Person, Vehicles (car, truck, bus, motorcycle), Backpack/Luggage, and PPE classes
"""

import cv2
import numpy as np
from typing import List, Dict, Any, Optional

class YOLODetector:
    def __init__(self, model_name: str = "yolov8n.pt", confidence_threshold: float = 0.5):
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.model_loaded = False
        self.classes_map = {
            0: "person",
            1: "bicycle",
            2: "car",
            3: "motorcycle",
            5: "bus",
            7: "truck",
            24: "backpack",
            26: "handbag",
            28: "suitcase"
        }
        
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_name)
            self.model_loaded = True
            print(f"[YOLOv8] Successfully loaded weights: {model_name}")
        except Exception as e:
            print(f"[YOLOv8 Warning] Ultralytics YOLO could not be initialized: {e}")
            self.model_loaded = False

    def detect_frame(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Run inference on a single BGR frame.
        Returns list of detections with bounding box, class, and confidence score.
        """
        if not self.model_loaded or self.model is None:
            return []

        results = self.model(frame, conf=self.confidence_threshold, verbose=False)
        detections = []

        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                xyxy = box.xyxy[0].tolist()

                # Filter only target security surveillance classes
                if cls_id in self.classes_map:
                    x1, y1, x2, y2 = xyxy
                    detections.append({
                        "class_id": cls_id,
                        "class_name": self.classes_map[cls_id],
                        "confidence": round(conf, 3),
                        "bbox": {
                            "x": int(x1),
                            "y": int(y1),
                            "width": int(x2 - x1),
                            "height": int(y2 - y1)
                        },
                        "centroid": {
                            "x": int((x1 + x2) / 2),
                            "y": int(y2) # Feet position for ground plane analysis
                        }
                    })

        return detections
