import React, { useState } from 'react';
import API_BASE_URL from '../config';

function Register({ switchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const registerUser = async () => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    const data = await response.json();
    if (data.success) {
      setSuccessMsg('Registration successful! Please login.');
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError(data.message || 'Registration failed');
      setSuccessMsg('');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      {successMsg && <p style={{color:'green'}}>{successMsg}</p>}
      <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={registerUser}>Register</button>
      <p>
        Already have an account? <button style={{color:'blue',background:'none',border:'none',cursor:'pointer'}} onClick={switchToLogin}>Login here</button>
      </p>
    </div>
  );
}

export default Register;
