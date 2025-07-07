import React, { useState } from 'react';
import './ResetPasswordPage.css';

import { useParams, useNavigate } from 'react-router-dom';



function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/reset_password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset successful! You can now sign in.');
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        setMessage(data.message || 'Invalid or expired token.');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setMessage('Error resetting password.');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Enter New Password:
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Reset Password</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ResetPasswordPage;
