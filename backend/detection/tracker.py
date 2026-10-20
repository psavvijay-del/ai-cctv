"""
AI-Based Intelligent CCTV Surveillance System
Object Tracking Engine (ByteTrack / IoU Association)
Assigns persistent Track IDs across video frames for trajectory and abandoned-object monitoring.
"""

from typing import List, Dict, Any

class SimpleTracker:
    def __init__(self, iou_threshold: float = 0.35, max_age_frames: int = 30):
        self.iou_threshold = iou_threshold
        self.max_age_frames = max_age_frames
        self.next_track_id = 1
        self.active_tracks: Dict[int, Dict[str, Any]] = {}

    @staticmethod
    def calculate_iou(boxA: Dict[str, int], boxB: Dict[str, int]) -> float:
        xA = max(boxA["x"], boxB["x"])
        yA = max(boxA["y"], boxB["y"])
        xB = min(boxA["x"] + boxA["width"], boxB["x"] + boxB["width"])
        yB = min(boxA["y"] + boxA["height"], boxB["y"] + boxB["height"])

        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = boxA["width"] * boxA["height"]
        boxBArea = boxB["width"] * boxB["height"]
        unionArea = boxAArea + boxBArea - interArea

        if unionArea <= 0:
            return 0.0
        return interArea / unionArea

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Associates current frame detections with existing active tracks.
        """
        updated_detections = []
        assigned_track_ids = set()

        for det in detections:
            bbox = det["bbox"]
            best_iou = 0.0
            best_track_id = None

            for track_id, track_data in self.active_tracks.items():
                if track_id in assigned_track_ids:
                    continue
                if track_data["class_name"] != det["class_name"]:
                    continue

                iou = self.calculate_iou(bbox, track_data["bbox"])
                if iou > best_iou and iou >= self.iou_threshold:
                    best_iou = iou
                    best_track_id = track_id

            if best_track_id is not None:
                # Update existing track
                self.active_tracks[best_track_id]["bbox"] = bbox
                self.active_tracks[best_track_id]["age"] = 0
                self.active_tracks[best_track_id]["trajectory"].append(det["centroid"])
                assigned_track_ids.add(best_track_id)
                det["track_id"] = best_track_id
            else:
                # Spawn new track ID
                new_id = self.next_track_id
                self.next_track_id += 1
                self.active_tracks[new_id] = {
                    "class_name": det["class_name"],
                    "bbox": bbox,
                    "age": 0,
                    "trajectory": [det["centroid"]]
                }
                assigned_track_ids.add(new_id)
                det["track_id"] = new_id

            updated_detections.append(det)

        # Age and purge tracks not seen
        dead_tracks = []
        for track_id, track_data in self.active_tracks.items():
            if track_id not in assigned_track_ids:
                track_data["age"] += 1
                if track_data["age"] > self.max_age_frames:
                    dead_tracks.append(track_id)

        for tid in dead_tracks:
            del self.active_tracks[tid]

        return updated_detections
