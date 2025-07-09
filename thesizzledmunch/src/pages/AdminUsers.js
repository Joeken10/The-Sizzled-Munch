import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import './AdminUsers.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [storedUser, setStoredUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    profileImage: '',
  });

  const adminId = storedUser?.id;

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users?admin_id=${adminId}`);
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      const formattedUsers = data.map((user) => ({
        ...user,
        isOnline: user.is_online,
        profileImage: user.profile_image,
      }));
      setUsers(formattedUsers);
    } catch {
      toast.error('Failed to load users');
    }
  }, [adminId]);

  useEffect(() => {
    if (adminId) {
      fetchUsers();
    }
  }, [adminId, fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId }),
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success('User deleted');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Request failed');
    }
  };

  const handlePromoteDemote = async (userId, action) => {
    const confirmMsg =
      action === 'promote'
        ? 'Are you sure you want to promote this user to admin?'
        : 'Are you sure you want to demote this admin?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId }),
      });

      if (res.ok) {
        const msg = action === 'promote' ? 'User promoted to admin' : 'User demoted from admin';
        toast.success(msg);

        if (userId === adminId) {
          const updatedUser = { ...storedUser, isAdmin: action === 'promote' };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setStoredUser(updatedUser);

          if (action === 'demote') {
            toast.info('You have been demoted. Logging out...');
            setTimeout(() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }, 2000);
            return;
          }
        }

        await fetchUsers();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to update user');
      }
    } catch {
      toast.error('Request failed');
    }
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      profileImage: user.profileImage || '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminId,
          username: formData.username,
          password: formData.password,
          profile_image: formData.profileImage,
        }),
      });

      if (res.ok) {
        toast.success('User updated successfully');
        await fetchUsers();

        if (editingUser.id === adminId) {
          const updatedUser = {
            ...storedUser,
            username: formData.username,
            profileImage: formData.profileImage,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setStoredUser(updatedUser);
        }

        setEditingUser(null);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to update user');
      }
    } catch {
      toast.error('Request failed');
    }
  };

  return (
    <div className="orders-container">
      <h2>All Users (Admin Control)</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="orders-grid">
          {users.map((user) => (
            <div key={user.id} className="order-card">
              <img
                src={user.profileImage || 'https://via.placeholder.com/150'}
                alt={`${user.username}'s avatar`}
                className="user-avatar"
              />
              <h3>{user.username}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`user-status ${user.isOnline ? 'online' : 'offline'}`}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </p>
              <p>
                <strong>Admin:</strong>{' '}
                <span className={`admin-indicator ${user.isAdmin ? 'admin-yes' : 'admin-no'}`}></span>
                {user.isAdmin ? 'Yes' : 'No'}
              </p>

              {user.id === adminId ? (
                <>
                  <button
                    className="clear-history-btn"
                    onClick={() => openEditForm(user)}
                  >
                    Update User
                  </button>
                  <p><em>You (Admin)</em></p>
                </>
              ) : (
                <>
                  <button
                    className="clear-history-btn"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete User
                  </button>
                  {user.isAdmin ? (
                    <button
                      className="clear-history-btn demote-btn"
                      onClick={() => handlePromoteDemote(user.id, 'demote')}
                    >
                      Demote Admin
                    </button>
                  ) : (
                    <button
                      className="clear-history-btn promote-btn"
                      onClick={() => handlePromoteDemote(user.id, 'promote')}
                    >
                      Promote to Admin
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Your Profile</h3>
            <form onSubmit={handleUpdateSubmit}>
              <input
                type="text"
                name="username"
                placeholder="New Username"
                value={formData.username}
                onChange={handleFormChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleFormChange}
              />
              <input
                type="text"
                name="profileImage"
                placeholder="Profile Image URL"
                value={formData.profileImage}
                onChange={handleFormChange}
              />
              <button type="submit" className="clear-history-btn">Save Changes</button>
              <button
                type="button"
                className="clear-history-btn demote-btn"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
