import React, { useState, useEffect, useContext } from 'react';
import './UserProfile.css';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

function UserProfile({ userId }) {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    delivery_address: '',
    phone_number: '',
    profile_image: ''
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/user/${userId}/profile`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          username: data.username,
          email: data.email,
          delivery_address: data.delivery_address,
          phone_number: data.phone_number,
          profile_image: data.profile_image || ''
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/user/${userId}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    })
      .then(() => {
        setMessage('Profile updated successfully!');
        setEditMode(false);
        setUser((prev) => ({
          ...prev,
          ...profile
        }));
      })
      .catch((err) => console.error('Failed to update profile:', err));
  };

  const confirmDelete = async (password) => {
    try {
      const res = await fetch(`http://localhost:8000/user/${userId}/self_delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setMessage('Account deleted successfully.');
        setUser(null);
        navigate('/');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete account.');
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setShowModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="user-profile-form">
      <h2>My Profile</h2>

      {message && <p className="success-message">{message}</p>}

      <img
        src={profile.profile_image || 'https://via.placeholder.com/150'}
        alt="Profile"
        className="profile-image"
      />

      {editMode ? (
        <form onSubmit={handleSubmit}>
          <label>Profile Image URL:</label>
          <input
            type="text"
            value={profile.profile_image}
            onChange={(e) => setProfile({ ...profile, profile_image: e.target.value })}
          />
          <label>Username:</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            required
          />
          <label>Email:</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            required
          />
          <label>Delivery Address:</label>
          <input
            type="text"
            value={profile.delivery_address}
            onChange={(e) => setProfile({ ...profile, delivery_address: e.target.value })}
            required
          />
          <label>Phone Number:</label>
          <input
            type="text"
            value={profile.phone_number}
            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
            required
          />
          <div className="button-group">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Delivery Address:</strong> {profile.delivery_address}</p>
          <p><strong>Phone Number:</strong> {profile.phone_number}</p>
          <div className="button-group">
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
            <button className="delete-button" onClick={() => setShowModal(true)}>Delete Profile</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}

      
      {showModal && (
        <PasswordConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function PasswordConfirmModal({ onConfirm, onCancel }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Account Deletion</h2>
        <p>Please enter your password to confirm deletion:</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <div className="modal-buttons">
            <button type="submit" className="confirm-button">Confirm Delete</button>
            <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
