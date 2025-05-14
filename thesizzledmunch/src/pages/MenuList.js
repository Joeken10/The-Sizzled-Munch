import React, { useEffect, useState } from 'react';
import './MenuList.css';
import MenuItem from './MenuItem';

function MenuList() {
  const [albums, setAlbums] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchAlbumData();
  }, []); // Added [] to avoid infinite fetch loop

  const fetchAlbumData = () => {
    fetch('http://localhost:5000/menuList')
      .then(response => response.json())
      .then(data => setAlbums(data));
  };

  const handleAddToCart = (item) => {
    setCart([...cart, item]);
  };

  return (
    <div className='menuList-container'>
      <MenuItem menuAlbum={albums} onAddToCart={handleAddToCart} />
      
      <div className='cart-section'>
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.itemName} - ksh.{item.price}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MenuList;
