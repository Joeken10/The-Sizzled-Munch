// ✅ No Firebase, Fully Fixed
import React, { useState, useContext, useEffect } from 'react';
import './AuthForms.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

function SignIn() {
  const { user, setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const verified = new URLSearchParams(location.search).get('verified');
  const API_URL = process.env.REACT_APP_API_URL || 'https://the-sizzled-munch.onrender.com';

  const apiFetch = async (url, options = {}) => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        credentials: 'include',
        ...options,
      });
      return response;
    } catch (err) {
      console.error(`Network error during ${url}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? '/admin/menu' : '/');
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          navigate(parsedUser.isAdmin ? '/admin/menu' : '/');
        } catch (err) {
          console.error('Failed to parse stored user:', err);
          localStorage.removeItem('user');
        }
      }
    }
  }, [user, navigate, setUser]);

  useEffect(() => {
    document.querySelector('input[aria-label="Email"]')?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,          // ✅ Correct key
          password: trimmedPassword,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        setError('Unexpected server response. Please try again later.');
        return;
      }

      if (response.ok) {
        if (data.is_password_reset_pending) {
          setError('Password reset pending. Please reset your password first.');
          return;
        }

        setUser(data);
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(data));
        } else {
          localStorage.removeItem('user');
        }

        toast.success('Signed in successfully!');
        navigate(data.isAdmin ? '/admin/menu' : '/');
      } else {
        setError(data.error || 'Invalid email or password.');
        setPassword('');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || !email.trim() || !password.trim();

  return (
    <div className="signin-container" role="main" aria-labelledby="signin-title">
      <h2 id="signin-title">Sign In</h2>

      {verified && (
        <p className="success-message" aria-live="polite" role="alert">
          Email verified successfully! You can now sign in.
        </p>
      )}

      {error && (
        <p className="error-message" aria-live="assertive" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          placeholder="Email"
          aria-label="Email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={loading}
            style={{
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              lineHeight: 1,
              padding: 0,
              marginLeft: '8px',
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((prev) => !prev)}
              aria-label="Remember Me"
              disabled={loading}
            />
            Remember Me
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          aria-disabled={isSubmitDisabled}
          aria-busy={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p>
        Don’t have an account?{' '}
        <Link to="/signup" aria-label="Go to Sign Up">
          Sign Up here
        </Link>
      </p>
      <p>
        <Link to="/forgot_password" className="forgot-link" aria-label="Forgot Password">
          Forgot Password?
        </Link>
      </p>
    </div>
  );
}

export default SignIn;
