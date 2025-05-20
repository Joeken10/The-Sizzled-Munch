import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ cartItemCount }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchInput)}`);
      setSearchInput('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="logo-text">The Sizzled Munch</Link>
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

      <form onSubmit={handleSearch} className="navbar-search">
        <input
          type="text"
          placeholder="Search menu..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      <div className="navbar-icons">
        <Link to="/user" className="icon-link">
          <img src="/icons/user-svgrepo-com.svg" alt="User" className="icon-img" />
        </Link>
        <Link to="/cart" className="icon-link">
          <img src="/icons/add-to-bag-svgrepo-com.svg" alt="Cart" className="icon-img" />
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
