import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import './PoseDetector.css';

const PoseDetector = ({ selectedPose, onFeedbackUpdate, onDetectionStateChange }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState(null);
  const API_URL = 'http://localhost:5000';

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  const startWebcam = () => {
    setIsWebcamActive(true);
    onDetectionStateChange(true);
  };

  const stopWebcam = () => {
    setIsWebcamActive(false);
    onDetectionStateChange(false);
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const captureAndDetect = async () => {
    if (!webcamRef.current || isProcessing) return;

    setIsProcessing(true);
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/detect-pose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc, pose: selectedPose })
      });
      const data = await response.json();
      if (data.success && data.landmarks) {
        drawPoseLandmarks(data.landmarks);
        if (data.feedback && data.feedback.length > 0) {
          onFeedbackUpdate(data.feedback);
        }
      }
    } catch (error) {
      onFeedbackUpdate([{ joint: 'CONNECTION', message: 'Error connecting to server.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const drawPoseLandmarks = (landmarks) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pixelLandmarks = landmarks.map(lm => ({
      x: lm.x * canvas.width, 
      y: lm.y * canvas.height, 
      visibility: lm.visibility
    }));
    
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;

    POSE_CONNECTIONS.forEach(([start, end]) => {
      const startPoint = pixelLandmarks[start];
      const endPoint = pixelLandmarks[end];
      if (startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });

    ctx.fillStyle = '#FF0000';
    pixelLandmarks.forEach(landmark => {
      if (landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x, landmark.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  useEffect(() => {
    if (isWebcamActive && !detectionInterval) {
      const interval = setInterval(captureAndDetect, 500);
      setDetectionInterval(interval);
    }
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [isWebcamActive, selectedPose]);

  return (
    <div className="pose-detector">
      <h2>Webcam Feed</h2>
      <div className="video-container">
        {isWebcamActive ? (
          <>
            <Webcam 
              ref={webcamRef} 
              audio={false} 
              screenshotFormat="image/jpeg" 
              videoConstraints={videoConstraints} 
              className="webcam" 
            />
            <canvas ref={canvasRef} className="pose-canvas" />
          </>
        ) : (
          <div className="placeholder">
            <p>Click "Start Webcam" to begin pose detection</p>
          </div>
        )}
      </div>
      <div className="controls">
        {!isWebcamActive ? (
          <button onClick={startWebcam} className="btn btn-primary">
            📹 Start Webcam
          </button>
        ) : (
          <button onClick={stopWebcam} className="btn btn-danger">
            ⏹️ Stop Webcam
          </button>
        )}
      </div>
      {isProcessing && (
        <div className="processing-indicator">
          <span>Analyzing pose...</span>
        </div>
      )}
    </div>
  );
};

export default PoseDetector;
