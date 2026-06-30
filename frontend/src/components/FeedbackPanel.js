import React from 'react';
import './FeedbackPanel.css';

const FeedbackPanel = ({ feedback }) => {
  return (
    <div className="feedback-panel">
      <h3>🎯 Pose Corrections</h3>
      {feedback.length === 0 ? (
        <div className="no-feedback">
          <p>✅ Start detecting to see corrections</p>
        </div>
      ) : (
        <div className="feedback-list">
          {feedback.map((item, index) => (
            <div key={index} className="feedback-item">
              <div className="feedback-header">
                <span className="joint-name">📍 {item.joint || 'Joint'}</span>
              </div>
              <p className="feedback-message">{item.message || item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
