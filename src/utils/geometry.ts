/**
 * Geometry and spatial calculations for CCTV intrusion zones and bounding boxes.
 */

export interface Point {
  x: number; // Normalized 0-1 or pixel coordinates
  y: number;
}

export interface BoundingBox {
  x: number; // Top-left x
  y: number; // Top-left y
  width: number;
  height: number;
}

/**
 * Determines whether a point is inside a polygon using ray casting algorithm.
 * Works with both normalized coordinates (0-1) and absolute canvas pixel coordinates.
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculates the bottom-center or center centroid of a bounding box.
 * For person intrusion detection, the bottom-center (feet position) is standard.
 */
export function getBoxCentroid(box: BoundingBox, useGroundPoint = true): Point {
  return {
    x: box.x + box.width / 2,
    y: useGroundPoint ? box.y + box.height : box.y + box.height / 2,
  };
}

/**
 * Calculates Intersection Over Union (IoU) between two bounding boxes.
 */
export function calculateIoU(boxA: BoundingBox, boxB: BoundingBox): number {
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const intersectionArea = interWidth * interHeight;

  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;
  const unionArea = boxAArea + boxBArea - intersectionArea;

  if (unionArea <= 0) return 0;
  return intersectionArea / unionArea;
}

/**
 * Calculates Euclidean distance between two points.
 */
export function euclideanDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
