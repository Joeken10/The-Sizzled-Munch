import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const apiFetch = (url, options = {}) =>
  fetch(`${API_URL}${url}`, { credentials: 'include', ...options });

function EmailVerificationPage() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  // Autofocus on verification code input when email is present
  useEffect(() => {
    if (email) {
      document.getElementById('verification-code')?.focus();
    }
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoadingVerify(true);
    setError('');
    setMessage('');
    setResendMessage('');

    try {
      const res = await apiFetch('/verify_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), verification_code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Email verified successfully!');
        setTimeout(() => {
          setUser(null); // Clear user context after verification
          localStorage.removeItem('user'); 
          navigate('/signin?verified=1'); 
        }, 2000);
      } else {
        if (data.error?.toLowerCase().includes('expired')) {
          setError('Verification code expired. Sending a new code...');
          await handleResendCode(true);
        } else {
          setError(data.error || 'Verification failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Network or server error. Please try again later.');
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResendCode = async (silent = false) => {
    if (!email) return;
    setLoadingResend(true);
    if (!silent) {
      setResendMessage('');
      setError('');
    }

    try {
      const res = await apiFetch('/resend_verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!silent) setResendMessage(data.message || 'Verification code resent!');
      } else {
        if (!silent) setResendMessage(data.error || 'Failed to resend verification code.');
      }
    } catch (err) {
      console.error('Resend code error:', err);
      if (!silent) setResendMessage('Network or server error. Please try again later.');
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div style={styles.container} role="main" aria-labelledby="email-verification-title">
      <h2 id="email-verification-title">Email Verification</h2>

      <form onSubmit={handleVerify} style={styles.form} noValidate>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          disabled={!!user?.email}
          aria-label="Email address"
          autoComplete="email"
        />
        <input
          id="verification-code"
          type="text"
          placeholder="Enter verification code"
          value={code}
          required
          onChange={(e) => setCode(e.target.value)}
          style={styles.input}
          aria-label="Verification code"
          autoComplete="one-time-code"
        />
        <button
          type="submit"
          style={styles.button}
          disabled={loadingVerify || loadingResend}
          aria-busy={loadingVerify}
        >
          {loadingVerify ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <button
        onClick={() => handleResendCode(false)}
        style={styles.resendButton}
        disabled={loadingVerify || loadingResend || !email}
        aria-busy={loadingResend}
        aria-disabled={loadingVerify || loadingResend || !email}
      >
        {loadingResend ? 'Sending...' : 'Resend Verification Code'}
      </button>

      {resendMessage && (
        <p role="alert" style={styles.info}>
          {resendMessage}
        </p>
      )}
      {message && (
        <p role="alert" style={styles.success}>
          {message}
        </p>
      )}
      {error && (
        <p role="alert" style={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff',
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
    backgroundColor: '#28a745',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  success: {
    color: 'green',
    marginTop: '15px',
  },
  error: {
    color: 'red',
    marginTop: '15px',
  },
  info: {
    color: 'blue',
    marginTop: '15px',
  },
};

export default EmailVerificationPage;
