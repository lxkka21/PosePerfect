import React from 'react';
import './PoseSelector.css';

const POSES = [
  { id: 'tree_pose', name: 'Tree Pose', emoji: '🌳' },
  { id: 'warrior_pose', name: 'Warrior Pose', emoji: '⚔️' },
  { id: 'downward_dog', name: 'Downward Dog', emoji: '🐕' },
  { id: 'mountain_pose', name: 'Mountain Pose', emoji: '⛰️' },
  { id: 'cobra_pose', name: 'Cobra Pose', emoji: '🐍' }
];

const PoseSelector = ({ selectedPose, onPoseChange, disabled }) => {
  return (
    <div className="pose-selector">
      <h3>Select Yoga Pose</h3>
      <div className="pose-list">
        {POSES.map((pose) => (
          <button
            key={pose.id}
            className={`pose-button ${selectedPose === pose.id ? 'active' : ''}`}
            onClick={() => onPoseChange(pose.id)}
            disabled={disabled}
          >
            <span className="pose-emoji">{pose.emoji}</span>
            <span className="pose-name">{pose.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PoseSelector;
