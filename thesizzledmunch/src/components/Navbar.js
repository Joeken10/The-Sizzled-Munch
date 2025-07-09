import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './Navbar.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function Navbar({ cartItemCount }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-logo">
        <Link to="/" className="logo-text">
          The Sizzled Munch
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`}>
            Menu
          </Link>
        </li>
      </ul>

      <form onSubmit={handleSearch} className="navbar-search" aria-label="Search menu">
        <input
          type="text"
          placeholder="Search menu..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search menu input"
        />
        <button type="submit" aria-label="Search">
          🔍
        </button>
      </form>

      <div className="navbar-icons">
        {user ? (
          <>
            <span className="nav-username">Hello, {user.username}</span>

            {user.isAdmin ? (
              <>
                <button
                  onClick={() => navigate('/admin/menu')}
                  className="nav-button"
                  aria-label="Manage Menu"
                >
                  Menu
                </button>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="nav-button"
                  aria-label="Manage Orders"
                >
                  Orders
                </button>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="nav-button"
                  aria-label="Manage Users"
                >
                  Users
                </button>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="nav-button"
                  aria-label="Admin Dashboard"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="logout-button"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/my-orders')}
                  className="nav-button"
                  aria-label="My Orders"
                >
                  My Orders
                </button>
                <Link to="/profile" className="profile-avatar" aria-label="My Profile">
                  <img
                    src={user.profile_image || '/default-avatar.png'}
                    alt="My Profile"
                    className="avatar-img"
                  />
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/signin" className="icon-link" title="Sign In">
              <img
                src="/icons/user-svgrepo-com.svg"
                alt="Sign In"
                className="icon-img"
              />
            </Link>
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </>
        )}

        <Link to="/cart" className="icon-link" title="Cart">
          <img
            src="/icons/add-to-bag-svgrepo-com.svg"
            alt="Cart"
            className="icon-img"
          />
          {cartItemCount > 0 && (
            <span className="cart-badge" aria-label={`${cartItemCount} items in cart`}>
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
