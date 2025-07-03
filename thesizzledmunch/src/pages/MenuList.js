import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import './MenuList.css';
import MenuItem from './MenuItem';
import { AuthContext } from '../App';

function MenuList({ cart, setCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
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

  
  const handleAddToCart = async (item) => {
    if (!user?.id) {
      alert('You must be logged in to add items to cart.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/cart_items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          menu_item_id: item.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const newItem = await response.json();

      setCart((prevCart) => {
        const existing = prevCart.find((cartItem) => cartItem.id === newItem.id);
        if (existing) {
          return prevCart.map((cartItem) =>
            cartItem.id === newItem.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        } else {
          return [...prevCart, { ...item, ...newItem, quantity: 1 }];
        }
      });
    } catch (error) {
      console.error(error);
      alert('Failed to add item to cart');
    }
  };

 
  const filteredItems = menuItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery)
  );

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
