import React, { useState, useContext, useEffect } from 'react';
import './AuthForms.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

function SignIn() {
  const { user, setUser } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const verified = new URLSearchParams(location.search).get('verified');

  const API_URL = 'https://the-sizzled-munch.onrender.com';

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
    document.querySelector('input[aria-label="Username or Email"]')?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedIdentifier = identifier.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      setError('Please enter your username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: trimmedIdentifier,
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
        setError(data.error || 'Invalid username/email or password.');
        setPassword('');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>

      {verified && (
        <p className="success-message" aria-live="polite">
          Email verified successfully! You can now sign in.
        </p>
      )}

      {error && (
        <p className="error-message" aria-live="assertive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          placeholder="Username or Email"
          aria-label="Username or Email"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
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
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{ cursor: 'pointer' }}
            aria-label="Toggle Password Visibility"
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((prev) => !prev)}
              aria-label="Remember Me"
            />
            Remember Me
          </label>
        </div>

        <button type="submit" disabled={loading}>
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
