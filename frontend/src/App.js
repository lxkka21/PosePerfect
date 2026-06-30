import React, { useState, useRef } from 'react';
import './App.css';
import PoseDetector from './components/PoseDetector';
import PoseSelector from './components/PoseSelector';
import FeedbackPanel from './components/FeedbackPanel';
import ProgressChart from './components/ProgressChart';

function App() {
  const [selectedPose, setSelectedPose] = useState('tree_pose');
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedback, setFeedback] = useState([]); // ✅ Start with empty feedback
  const [progressData, setProgressData] = useState([
    { session: 1, accuracy: 60 },
    { session: 2, accuracy: 72 },
    { session: 3, accuracy: 68 },
    { session: 4, accuracy: 85 },
    { session: 5, accuracy: 90 },
  ]);
  
  const lastFeedback = useRef([]);
  const sessionCounter = useRef(5);
  const hasAddedSession = useRef(false);

  const handlePoseChange = (pose) => {
    setSelectedPose(pose);
    hasAddedSession.current = false;
  };

  const handleFeedbackUpdate = (newFeedback) => {
    if (!newFeedback || !Array.isArray(newFeedback)) {
      return;
    }

    if (newFeedback.length === 0) {
      return;
    }

    const hasRealContent = newFeedback.some(item => {
      if (typeof item === 'string' && item.trim() !== '') return true;
      if (item && item.message && item.message.trim() !== '') return true;
      return false;
    });

    if (hasRealContent) {
      lastFeedback.current = newFeedback;
      setFeedback(newFeedback);
      
      // Only add ONE session per detection cycle
      if (!hasAddedSession.current) {
        hasAddedSession.current = true;
        
        const accuracy = Math.max(50, 100 - (newFeedback.length * 10));
        sessionCounter.current += 1;
        
        setProgressData(prev => {
          const newSession = { 
            session: sessionCounter.current, 
            accuracy: accuracy 
          };
          const updated = [...prev, newSession];
          return updated.slice(-5);
        });
      }
    }
  };

  const handleDetectionStateChange = (detecting) => {
    setIsDetecting(detecting);
    if (detecting) {
      hasAddedSession.current = false;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧘 PosePerfect</h1>
        <p>AI-Powered Yoga Pose Detection & Correction</p>
      </header>
      <div className="main-container">
        <div className="left-panel">
          <PoseSelector 
            selectedPose={selectedPose}
            onPoseChange={handlePoseChange}
            disabled={isDetecting}
          />
          <FeedbackPanel feedback={feedback} />
          <ProgressChart data={progressData} />
        </div>

        <div className="center-panel">
          <PoseDetector 
            selectedPose={selectedPose}
            onFeedbackUpdate={handleFeedbackUpdate}
            onDetectionStateChange={handleDetectionStateChange}
          />
        </div>
      </div>
      <footer className="App-footer">
        <p>Built with MediaPipe & React.js</p>
      </footer>
    </div>
  );
}

export default App;
