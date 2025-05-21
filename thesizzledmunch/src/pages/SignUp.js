import React, { useState, useContext } from 'react';
import './AuthForms.css'; 
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { auth, provider, signInWithPopup } from '../firebase'; 

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
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? '' : 'Please enter a valid email address.');
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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    if (!checkPasswordStrength(password)) {
      alert('Password is too weak.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const res = await fetch(`http://localhost:5000/users?username=${username}`);
    const existingUsers = await res.json();
    if (existingUsers.length > 0) {
      alert('Username already exists');
      return;
    }

    const newUser = { username, email, password };
    const response = await fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    const createdUser = await response.json();
    setUser(createdUser);
    navigate('/');
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      
      const res = await fetch('http://localhost:5000/users?email=' + user.email);
      const existingUsers = await res.json();

      if (existingUsers.length === 0) {
        const newUser = {
          username: user.displayName,
          email: user.email,
          password: '',
        };
        await fetch('http://localhost:5000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        });
      }

      setUser(user);
      navigate('/');
    } catch (error) {
      console.error("Google sign-in error:", error.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => validateEmail(email)}
          required
        />
        {emailError && <p style={{ color: 'red' }}>{emailError}</p>}

        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(prev => !prev)}
            style={{ cursor: 'pointer' }}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <small>
          Password must be at least 8 characters long and include a number, a special character, and both uppercase and lowercase letters.
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
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowConfirmPassword(prev => !prev)}
            style={{ cursor: 'pointer' }}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit">Sign Up</button>
      </form>

      <div className="or-divider">OR</div>

      <button onClick={handleGoogleSignUp} className="google-button">
        Sign Up with Google
      </button>

      <p>Already have an account? <Link to="/signin">Sign In here</Link></p>
    </div>
  );
}

export default SignUp;
