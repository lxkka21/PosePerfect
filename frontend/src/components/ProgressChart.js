import React from 'react';

const ProgressChart = ({ data }) => {
  // Default data if none provided
  const defaultSessions = [
    { session: 1, accuracy: 60 },
    { session: 2, accuracy: 72 },
    { session: 3, accuracy: 68 },
    { session: 4, accuracy: 85 },
    { session: 5, accuracy: 90 },
  ];

  const sessions = data || defaultSessions;

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.25)', 
      borderRadius: 16, 
      padding: 20, 
      marginTop: 20,
      border: '1px solid rgba(255,255,255,0.3)'
    }}>
      <h3 style={{ color: "#fff", marginBottom: 15, fontWeight: 700 }}>Progress Over Time</h3>
      {sessions.map((s) => (
        <div key={s.session} style={{ marginBottom: 15 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: 5, 
            fontSize: '0.95rem', 
            fontWeight: 700,
            color: '#fff'
          }}>
            <span>Session {s.session}</span>
            <span style={{ color: '#fff' }}>{s.accuracy}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: 12, 
            backgroundColor: 'rgba(255,255,255,0.3)', 
            borderRadius: 6, 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              width: `${s.accuracy}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #fbc7c7, #fff)', 
              borderRadius: 6,
              transition: 'width 0.5s ease',
              boxShadow: '0 2px 8px rgba(255,255,255,0.4)'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressChart;
