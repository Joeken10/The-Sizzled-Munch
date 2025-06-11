import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './MenuList.css';
import MenuItem from './MenuItem';

function MenuList({ cart, setCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search')?.toLowerCase() || '';

  // Fetch menu items on mount
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('http://localhost:8000/menu_items', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch menu items');
        return res.json();
      })
      .then((data) => setMenuItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Handle adding to cart
  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);

      let updatedCart;
      if (existingIndex >= 0) {
        updatedCart = prevCart.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      } else {
        updatedCart = [...prevCart, { ...item, quantity: 1 }];
      }

      console.log('Cart updated:', updatedCart); // ✅ Debug log
      return updatedCart;
    });
  };

  // Filter by search query
  const filteredItems = menuItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery)
  );

  // Render
  return (
    <div className="menuList-container">
      {loading ? (
        <p>Loading menu...</p>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : filteredItems.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <MenuItem menuAlbum={filteredItems} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}

export default MenuList;
