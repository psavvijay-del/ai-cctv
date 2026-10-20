import test from 'node:test';
import assert from 'node:assert/strict';
import { isPointInPolygon, getBoxCentroid, calculateIoU, euclideanDistance } from './geometry.ts';

test('isPointInPolygon detects point inside convex square', () => {
  const polygon = [
    { x: 0.1, y: 0.1 },
    { x: 0.5, y: 0.1 },
    { x: 0.5, y: 0.5 },
    { x: 0.1, y: 0.5 },
  ];

  assert.equal(isPointInPolygon({ x: 0.25, y: 0.25 }, polygon), true);
  assert.equal(isPointInPolygon({ x: 0.05, y: 0.25 }, polygon), false);
  assert.equal(isPointInPolygon({ x: 0.7, y: 0.7 }, polygon), false);
});

test('isPointInPolygon handles complex polygons and boundary', () => {
  // Triangle
  const triangle = [
    { x: 10, y: 10 },
    { x: 50, y: 10 },
    { x: 30, y: 40 },
  ];
  assert.equal(isPointInPolygon({ x: 30, y: 20 }, triangle), true);
  assert.equal(isPointInPolygon({ x: 5, y: 5 }, triangle), false);
  assert.equal(isPointInPolygon({ x: 10, y: 50 }, triangle), false);
});

test('getBoxCentroid calculates correct ground feet and center point', () => {
  const box = { x: 100, y: 200, width: 50, height: 100 };
  const groundCentroid = getBoxCentroid(box, true);
  assert.equal(groundCentroid.x, 125);
  assert.equal(groundCentroid.y, 300);

  const centerCentroid = getBoxCentroid(box, false);
  assert.equal(centerCentroid.x, 125);
  assert.equal(centerCentroid.y, 250);
});

test('calculateIoU returns accurate overlap ratio', () => {
  // Identical boxes
  const box1 = { x: 10, y: 10, width: 20, height: 20 };
  const box2 = { x: 10, y: 10, width: 20, height: 20 };
  assert.equal(calculateIoU(box1, box2), 1.0);

  // Non-overlapping boxes
  const box3 = { x: 100, y: 100, width: 20, height: 20 };
  assert.equal(calculateIoU(box1, box3), 0.0);

  // Partial overlap: boxA = 0..20 x 0..20 (area 400), boxB = 10..30 x 0..20 (area 400)
  // intersection = 10..20 x 0..20 = 10 * 20 = 200. Union = 400 + 400 - 200 = 600. IoU = 200/600 = 1/3
  const boxA = { x: 0, y: 0, width: 20, height: 20 };
  const boxB = { x: 10, y: 0, width: 20, height: 20 };
  const iou = calculateIoU(boxA, boxB);
  assert.ok(Math.abs(iou - 1 / 3) < 0.0001);
});

test('euclideanDistance calculates straight line distance', () => {
  const p1 = { x: 0, y: 0 };
  const p2 = { x: 3, y: 4 };
  assert.equal(euclideanDistance(p1, p2), 5);
});
