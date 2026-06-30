from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import base64
import math

app = Flask(__name__)
CORS(app)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, smooth_landmarks=True,
                    min_detection_confidence=0.5, min_tracking_confidence=0.5)

REFERENCE_POSES = {
    "tree_pose": {
        "left_knee": 160,
        "right_knee": 90,
        "left_hip": 170,
        "right_hip": 90,
        "spine": 170
    },
    "warrior_pose": {
        "left_knee": 90,
        "right_knee": 170,
        "left_hip": 90,
        "right_hip": 170,
        "spine": 160
    },
    "downward_dog": {
        "left_knee": 170,
        "right_knee": 170,
        "left_hip": 90,
        "right_hip": 90,
        "spine": 160
    },
    "mountain_pose": {
        "left_knee": 175,
        "right_knee": 175,
        "left_hip": 175,
        "right_hip": 175,
        "left_elbow": 180,
        "right_elbow": 180
    },
    "cobra_pose": {
        "left_knee": 180,
        "right_knee": 180,
        "left_hip": 160,
        "right_hip": 160,
        "left_elbow": 90,
        "right_elbow": 90
    }
}

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

def extract_landmarks(results):
    if not results.pose_landmarks:
        return None
    landmarks = results.pose_landmarks.landmark
    key_points = {
        "left_shoulder": [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                          landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y],
        "right_shoulder": [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                           landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y],
        "left_elbow": [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                       landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y],
        "right_elbow": [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                        landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y],
        "left_wrist": [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                       landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y],
        "right_wrist": [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                        landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y],
        "left_hip": [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y],
        "right_hip": [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y],
        "left_knee": [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y],
        "right_knee": [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y],
        "left_ankle": [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                       landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y],
        "right_ankle": [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                        landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]
    }
    return key_points

def calculate_pose_angles(key_points):
    angles = {}
    angles['left_knee'] = calculate_angle(key_points['left_hip'], key_points['left_knee'], key_points['left_ankle'])
    angles['right_knee'] = calculate_angle(key_points['right_hip'], key_points['right_knee'], key_points['right_ankle'])
    angles['left_hip'] = calculate_angle(key_points['left_shoulder'], key_points['left_hip'], key_points['left_knee'])
    angles['right_hip'] = calculate_angle(key_points['right_shoulder'], key_points['right_hip'], key_points['right_knee'])
    angles['left_elbow'] = calculate_angle(key_points['left_shoulder'], key_points['left_elbow'], key_points['left_wrist'])
    angles['right_elbow'] = calculate_angle(key_points['right_shoulder'], key_points['right_elbow'], key_points['right_wrist'])
    return angles

def generate_feedback(current_angles, reference_pose):
    if reference_pose not in REFERENCE_POSES:
        return {"error": "Unknown pose"}
    reference_angles = REFERENCE_POSES[reference_pose]
    feedback = []
    threshold = 15
    for joint, ref_angle in reference_angles.items():
        if joint in current_angles:
            diff = current_angles[joint] - ref_angle
            if abs(diff) > threshold:
                if diff > 0:
                    feedback.append({
                        "joint": joint,
                        "message": f"Bend your {joint.replace('_', ' ')} more (decrease angle by {abs(diff):.1f}°)",
                        "angle_diff": diff
                    })
                else:
                    feedback.append({
                        "joint": joint,
                        "message": f"Straighten your {joint.replace('_', ' ')} more (increase angle by {abs(diff):.1f}°)",
                        "angle_diff": diff
                    })
    return feedback

@app.route('/api/detect-pose', methods=['POST'])
def detect_pose():
    try:
        data = request.json
        image_data = data.get('image')
        selected_pose = data.get('pose', 'tree_pose')
        image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        if not results.pose_landmarks:
            return jsonify({
                "success": False,
                "message": "No pose detected. Please ensure your full body is visible."
            })
        key_points = extract_landmarks(results)
        current_angles = calculate_pose_angles(key_points)
        feedback = generate_feedback(current_angles, selected_pose)
        landmarks_list = [{"x": lm.x, "y": lm.y, "z": lm.z, "visibility": lm.visibility}
                          for lm in results.pose_landmarks.landmark]
        return jsonify({
            "success": True,
            "landmarks": landmarks_list,
            "angles": current_angles,
            "feedback": feedback,
            "pose_detected": len(feedback) == 0
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing image: {str(e)}"}), 500

@app.route('/api/poses', methods=['GET'])
def get_poses():
    return jsonify({"poses": list(REFERENCE_POSES.keys())})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
