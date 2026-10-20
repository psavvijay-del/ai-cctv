"""
AI-Based Intelligent CCTV Surveillance System
Module B: Restricted-Area Intrusion Detection Engine
Implements Point-in-Polygon (Ray Casting) algorithm and virtual tripwire crossings.
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Any

class IntrusionDetector:
    def __init__(self, alert_cooldown_seconds: float = 3.0):
        self.alert_cooldown = alert_cooldown_seconds
        self.last_alerts: Dict[str, float] = {}

    @staticmethod
    def is_point_in_polygon(point: Tuple[float, float], polygon: List[Tuple[float, float]]) -> bool:
        """
        Uses OpenCV's cv2.pointPolygonTest or geometric ray casting.
        Returns True if point is strictly inside or on the contour.
        """
        if len(polygon) < 3:
            return False
        
        pts = np.array(polygon, dtype=np.int32).reshape((-1, 1, 2))
        dist = cv2.pointPolygonTest(pts, (float(point[0]), float(point[1])), measureDist=False)
        return dist >= 0

    def evaluate_detections(
        self,
        detections: List[Dict[str, Any]],
        restricted_polygon: List[Tuple[float, float]],
        frame_width: int,
        frame_height: int
    ) -> List[Dict[str, Any]]:
        """
        Checks if detected person feet/centroid breaches the restricted polygon.
        Polygon can be normalized (0-1) or absolute pixels.
        """
        if not restricted_polygon or len(restricted_polygon) < 3:
            return []

        # Convert normalized polygon to frame coordinates if needed
        poly_pixels = []
        is_normalized = all(0.0 <= pt[0] <= 1.0 and 0.0 <= pt[1] <= 1.0 for pt in restricted_polygon)
        for pt in restricted_polygon:
            if is_normalized:
                poly_pixels.append((pt[0] * frame_width, pt[1] * frame_height))
            else:
                poly_pixels.append((pt[0], pt[1]))

        intrusion_events = []
        for det in detections:
            # Check persons and unauthorized vehicles
            if det.get("class_name") in ["person", "car", "motorcycle"]:
                centroid = (det["centroid"]["x"], det["centroid"]["y"])
                if self.is_point_in_polygon(centroid, poly_pixels):
                    intrusion_events.append({
                        "event_type": "Restricted-Area Intrusion",
                        "severity": "critical",
                        "object_class": det["class_name"],
                        "confidence": det["confidence"],
                        "bbox": det["bbox"],
                        "centroid": det["centroid"]
                    })

        return intrusion_events
