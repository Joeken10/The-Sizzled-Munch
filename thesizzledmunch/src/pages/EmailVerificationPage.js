import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

const EmailVerificationPage = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (email) {
      document.getElementById('verification-code')?.focus();
    }
  }, [email]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/verify_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verification_code: code }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setError('');
        setTimeout(() => {
          setUser(null);
          localStorage.removeItem('user');
          navigate('/signin?verified=1');
        }, 2000);
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err) {
      setError(err.message);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await apiFetch('/resend_verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setResendMessage(data.message);
        setResendCooldown(30);
      } else {
        throw new Error(data.error || 'Failed to resend verification code.');
      }
    } catch (err) {
      setResendMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Email Verification</h2>
      <form onSubmit={handleVerify} style={styles.form}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          disabled={!!user?.email}
        />
        <input
          id="verification-code"
          type="text"
          placeholder="Enter verification code"
          value={code}
          required
          onChange={(e) => setCode(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <button
        onClick={handleResendCode}
        style={{
          ...styles.resendButton,
          backgroundColor: resendCooldown > 0 ? '#ccc' : '#28a745',
          cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
        }}
        disabled={loading || !email || resendCooldown > 0}
      >
        {resendCooldown > 0
          ? `Resend in ${resendCooldown}s`
          : 'Resend Verification Code'}
      </button>

      {resendMessage && <p style={styles.info}>{resendMessage}</p>}
      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  resendButton: {
    marginTop: '10px',
    padding: '10px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
  },
  success: { color: 'green', marginTop: '15px' },
  error: { color: 'red', marginTop: '15px' },
  info: { color: 'blue', marginTop: '15px' },
};

export default EmailVerificationPage;
