import React, { useState } from 'react';
import './ResetPasswordPage.css';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setMessage('Password cannot be empty.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/reset_password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Password reset successful! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 2500);
      } else {
        setMessage(data.message || 'Invalid or expired token.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password">
          Enter New Password:
        </label>
        <input
          type="password"
          id="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ResetPasswordPage;
