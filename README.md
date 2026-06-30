# PosePerfect 🧘

AI-powered yoga pose detection and correction app that runs in your browser. Uses your webcam to analyze your pose in real time and provides feedback to help improve your alignment.

## Demo

Captures webcam frames every 500ms, sends them to the backend for MediaPipe pose estimation, and returns joint-angle-based corrections with visual skeleton overlay.

## Features

- **Real-time pose feedback** — get instant correction suggestions as you hold your pose
- **Multi-pose support** — Tree Pose, Warrior Pose, Downward Dog, Mountain Pose, and Cobra Pose
- **Visual skeleton overlay** — MediaPipe landmarks and body connections drawn on your webcam feed
- **Per-joint angle analysis** — 6 key joint angles measured (knees, hips, elbows) with 15° tolerance thresholds
- **Progress tracking** — session accuracy history visualized as a bar chart
- **Extensible** — add new poses by defining reference angles in the backend

## How It Works

```
┌─────────────┐    base64 image     ┌──────────────┐
│  React.js   │ ──────────────────►  │  Flask API   │
│  (Frontend) │   + pose name       │  (Backend)   │
│             │ ◄────────────────── │              │
│  Webcam +   │   landmarks +       │  MediaPipe   │
│  Canvas     │   angles + feedback │  Pose        │
└─────────────┘                     └──────────────┘
```

The frontend captures webcam frames via `react-webcam`, sends them as base64 to Flask, which runs MediaPipe Pose (model_complexity=1, smooth_landmarks=True), calculates joint angles, compares against reference pose angles, and returns correction feedback. The frontend then draws the skeleton overlay on a canvas and displays the feedback.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Flask (Python) + flask-cors |
| Pose Estimation | MediaPipe 0.10.3 (Python) |
| Frontend | React 19 + react-webcam |
| Rendering | Canvas API + POSE_CONNECTIONS |

## Project Structure

```
PosePerfect/
├── backend/
│   ├── flask_app.py          # Flask server with /api/detect-pose, /api/poses, /health
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js            # Main app (pose selection, detection state, progress)
│       ├── components/
│       │   ├── PoseDetector.js   # Webcam capture, API calls, canvas skeleton drawing
│       │   ├── PoseSelector.js   # Pose selection buttons (5 poses)
│       │   ├── FeedbackPanel.js  # Correction suggestion display
│       │   └── ProgressChart.js  # Session accuracy bar chart
│       └── ...styles and entry point
├── README.md
├── QUICK_START.md
└── IMPLEMENTATION-GUIDE.md
```

## Supported Poses

| Pose | Key Angles | Description |
|------|-----------|-------------|
| Tree Pose | Bent right knee ~90°, standing leg straight | Standing balance on one leg |
| Warrior Pose | Front knee ~90°, back leg straight | Lunge with arms extended |
| Downward Dog | Hips ~90°, legs straight | Inverted V-shape |
| Mountain Pose | Knees/elbows ~180° | Standing tall with arms up |
| Cobra Pose | Bent elbows ~90°, legs straight | Lying backbend |

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Webcam

### Backend

```bash
cd backend
pip install -r requirements.txt
python flask_app.py
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Opens on http://localhost:3000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/poses` | List supported poses |
| POST | `/api/detect-pose` | Send image for pose analysis |

`POST /api/detect-pose` accepts a JSON body with `image` (base64 string) and `pose` (pose name). Returns landmarks, joint angles, and per-joint feedback messages.

## Configuration

All values are currently hardcoded. Key tunables in the source:

- **Detection interval** — `PoseDetector.js:111` (500ms)
- **Feedback tolerance** — `flask_app.py:113` (15 degrees)
- **Model complexity** — `flask_app.py:13` (1 = full body)
- **Webcam resolution** — `PoseDetector.js:15-17` (640x480)

## Adding a New Pose

1. Add reference angles to `REFERENCE_POSES` in `backend/flask_app.py`
2. Add a button for the new pose in `frontend/src/components/PoseSelector.js`

## Notes

- All pose inference runs server-side. The frontend only handles capture and rendering.
- The `spine` angle reference exists in some pose definitions but is not yet computed — contributions welcome.
