import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './MenuList.css';
import MenuItem from './MenuItem';

function MenuList({ cart, setCart }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8000/menu_items', {
      credentials: 'include', // include session cookie if using login
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch menu');
        return res.json();
      })
      .then((data) => setAlbums(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
      if (existingIndex >= 0) {
        return prevCart.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const filteredAlbums = albums.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery)
  );

  if (loading) return <div className="menuList-container">Loading menu...</div>;
  if (error) return <div className="menuList-container error">Error: {error}</div>;

  return (
    <div className="menuList-container">
      {filteredAlbums.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <MenuItem menuAlbum={filteredAlbums} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}

export default MenuList;
