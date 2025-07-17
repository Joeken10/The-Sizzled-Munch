import React, { useState, useContext } from 'react';
import './AuthForms.css';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';

function SignUp() {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? '' : 'Invalid email address');
    return isValid;
  };

  const checkPasswordStrength = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (strongRegex.test(password)) {
      setPasswordStrength('Strong');
      return true;
    } else {
      setPasswordStrength('Weak');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) return;

    if (!checkPasswordStrength(password)) {
      toast.error('Password is too weak.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const newUser = {
        username: username.trim(),
        email: normalizedEmail,
        password,
        is_google: false,
      };

      const response = await apiFetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Sign up failed');
        return;
      }

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Sign up successful! Please verify your email.');
      navigate('/verify_email');
    } catch (err) {
      console.error('Sign up error:', err);
      toast.error('An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    toast.info('Google sign-up coming soon!'); // Placeholder
  };

  const isSubmitDisabled =
    loading || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim();

  return (
    <div className="signup-container" aria-label="Sign up form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="Username"
          required
          disabled={loading}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateEmail(email)}
          aria-label="Email address"
          required
          disabled={loading}
        />
        {emailError && <p style={{ color: 'red' }}>{emailError}</p>}

        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              checkPasswordStrength(e.target.value);
            }}
            aria-label="Password"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={loading}
            className="toggle-password"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <small>
          Password must include at least 8 characters, uppercase, lowercase, number, and symbol.
        </small>
        {password && (
          <p style={{ color: passwordStrength === 'Strong' ? 'green' : 'red' }}>
            Password Strength: {passwordStrength}
          </p>
        )}

        <div className="password-field">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-label="Confirm password"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            disabled={loading}
            className="toggle-password"
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button type="submit" disabled={isSubmitDisabled} aria-label="Sign up">
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <div className="or-divider">OR</div>

      <button
        onClick={handleGoogleSignUp}
        className="google-button"
        disabled={loading}
        aria-label="Sign up with Google"
      >
        {loading ? 'Loading...' : 'Sign Up with Google'}
      </button>

      <p>
        Already have an account? <Link to="/signin">Sign In here</Link>
      </p>
    </div>
  );
}

export default SignUp;
