-- ==============================================================================
-- AI-Based Intelligent CCTV Surveillance System
-- SQLite Relational Database Schema
-- Tables: CAMERAS, INCIDENTS, USERS, AUDIT_LOGS
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. CAMERAS TABLE
CREATE TABLE IF NOT EXISTS cameras (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK(source_type IN ('webcam', 'video_file', 'rtsp_stream')),
    connection_status TEXT NOT NULL DEFAULT 'online' CHECK(connection_status IN ('online', 'offline', 'warning')),
    resolution TEXT DEFAULT '1920x1080',
    fps INTEGER DEFAULT 30,
    rtsp_url_masked TEXT,
    restricted_zone_json TEXT, -- JSON coordinates of polygon vertices: [{"x": 0.1, "y": 0.3}, ...]
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- SHA-256 or bcrypt hashed password (never plaintext)
    role TEXT NOT NULL DEFAULT 'security_officer' CHECK(role IN ('admin', 'senior_operator', 'security_officer', 'auditor')),
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    camera_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'Restricted-Area Intrusion', 'Crowd Monitoring', 'Vehicle Incident', etc.
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'warning', 'info')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence REAL NOT NULL CHECK(confidence >= 0.0 AND confidence <= 1.0),
    clip_path TEXT,
    snapshot_url TEXT,
    review_status TEXT NOT NULL DEFAULT 'pending' CHECK(review_status IN ('pending', 'confirmed', 'dismissed')),
    reviewer_notes TEXT,
    reviewed_by TEXT,
    object_class TEXT,
    bbox_json TEXT, -- {"x": 200, "y": 150, "width": 80, "height": 180}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    username TEXT NOT NULL,
    action TEXT NOT NULL, -- 'LOGIN', 'REVIEW_CONFIRM', 'REVIEW_DISMISS', 'CAMERA_ADDED', 'POLYGON_EDITED'
    incident_id TEXT,
    details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL
);

-- INDEXES FOR HIGH-PERFORMANCE INCIDENT QUERIES
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_camera_id ON incidents(camera_id);
CREATE INDEX IF NOT EXISTS idx_incidents_review_status ON incidents(review_status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- SEED DATA (Demonstration Data)
INSERT OR IGNORE INTO cameras (id, name, location, source_type, connection_status, resolution, fps, last_active) VALUES
('CAM-01', 'Main Gate & Turnstile', 'North Entrance Gate A', 'video_file', 'online', '1920x1080', 30, CURRENT_TIMESTAMP),
('CAM-02', 'Logistics Warehouse Bay 4', 'Warehouse District B - Loading Bay', 'video_file', 'online', '1920x1080', 25, CURRENT_TIMESTAMP),
('CAM-03', 'Perimeter Fence Sector 9', 'Outer Security Perimeter East', 'video_file', 'online', '3840x2160', 30, CURRENT_TIMESTAMP),
('CAM-04', 'Executive Parking & Driveway', 'Corporate Center South Lot', 'video_file', 'online', '1920x1080', 24, CURRENT_TIMESTAMP),
('CAM-05', 'Live Security Console Webcam', 'SOC Control Station 1', 'webcam', 'online', '1280x720', 30, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO users (id, username, password_hash, role, email) VALUES
('USR-01', 'admin_soc', '$2b$12$e8Y6Q8M2f0L0oYhLz9X5EuOQ9kP1w4n7T.B7eC4qL9yZ2j7wX0m0O', 'admin', 'soc-admin@surveillance.corp'),
('USR-02', 'officer_miller', '$2b$12$K8M2f0L0oYhLz9X5EuOQ9kP1w4n7T.B7eC4qL9yZ2j7wX0m0Oe8Y6Q', 'security_officer', 'miller@surveillance.corp');

INSERT OR IGNORE INTO incidents (id, camera_id, event_type, severity, timestamp, confidence, review_status, reviewer_notes) VALUES
('INC-2026-891', 'CAM-03', 'Restricted-Area Intrusion', 'critical', datetime('now', '-18 minutes'), 0.942, 'pending', 'Potential unauthorized zone traversal detected near east perimeter barrier.'),
('INC-2026-889', 'CAM-01', 'Crowd Monitoring', 'warning', datetime('now', '-45 minutes'), 0.887, 'pending', 'Turnstile bottleneck density exceeded safety threshold (>12 individuals/10m²).'),
('INC-2026-885', 'CAM-02', 'Abandoned-Object Detection', 'warning', datetime('now', '-92 minutes'), 0.854, 'confirmed', 'Unattended parcel left on forklift transit line for >180 seconds. Cleared by duty guard.');
