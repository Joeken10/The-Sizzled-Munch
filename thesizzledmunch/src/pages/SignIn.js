import React, { useState, useContext } from 'react';
import './AuthForms.css'; 
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';

function SignIn() {
  const { setUser } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert('Please enter your username/email and password');
      return;
    }

    try {
      // Send username or email as "username" field per your backend (adjust if needed)
      const response = await fetch('http://localhost:8000/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // important for session cookies
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        navigate('/');
      } else {
        alert(data.error || 'Invalid username/email or password');
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
      console.error('SignIn error:', error);
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
        />

        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(prev => !prev)}
            />
            Show Password
          </label>
        </div>

        <button type="submit">Sign In</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign Up here</Link></p>
    </div>
  );
}

export default SignIn;
