import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './Navbar.css';

function Navbar({ cartItemCount }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchInput)}`);
      setSearchInput('');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    }

    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-logo">
        <Link to="/" className="logo-text">
          The Sizzled Munch
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/menu"
            className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`}
          >
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
                  className="admin-button"
                  aria-label="Manage Menu"
                >
                  Menu Management
                </button>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="admin-button"
                  aria-label="View All Orders"
                >
                  Orders
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/orders')}
                className="admin-button"
                aria-label="My Orders"
              >
                My Orders
              </button>
            )}
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
