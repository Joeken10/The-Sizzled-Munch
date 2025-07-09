import React, { useState, useContext } from 'react';
import './AuthForms.css';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { auth, provider, signInWithPopup } from '../firebase';
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
      const checkRes = await fetch(
        `http://127.0.0.1:8000/users/check?username=${encodeURIComponent(username)}&email=${encodeURIComponent(normalizedEmail)}`
      );
      const checkData = await checkRes.json();
      if (checkData.exists) {
        toast.error('Username or email already exists.');
        return;
      }

      const newUser = { username, email: normalizedEmail, password };
      const response = await fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Sign up failed');
        return;
      }

      const createdUser = await response.json();
      setUser(createdUser.user);
      localStorage.setItem('user', JSON.stringify(createdUser.user));

      toast.success('Sign up successful! Please check your email for the verification code.');
      navigate('/verify_email');
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const res = await fetch(`http://127.0.0.1:8000/users/check?email=${encodeURIComponent(googleUser.email)}`);
      const existingUsers = await res.json();

      if (!existingUsers.exists) {
        const newUser = {
          username: googleUser.displayName || googleUser.email.split('@')[0],
          email: googleUser.email,
          password: '',
        };
        await fetch('http://127.0.0.1:8000/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
      }

      const profileRes = await fetch(`http://127.0.0.1:8000/users/profile?email=${encodeURIComponent(googleUser.email)}`);
      const userProfile = await profileRes.json();
      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));

      navigate('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

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
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateEmail(email)}
          aria-label="Email address"
          required
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
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="toggle-password"
            style={{ cursor: 'pointer' }}
            aria-label="Toggle password visibility"
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <small>
          Password must have at least 8 characters, including numbers, symbols, uppercase and lowercase letters.
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
          />
          <span
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="toggle-password"
            style={{ cursor: 'pointer' }}
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit" disabled={loading} aria-label="Sign up">
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
