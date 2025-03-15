import React from 'react';
import './CartModal.css';

const CartModal = ({ cartItems = [], onClose, username = "Guest", proceedToCheckout, removeItem, updateQuantity }) => {
  console.log(username); // Debugging line to check username value

  // Aggregate cart items without mutating state
  const updatedCartItems = cartItems.reduce((acc, item) => {
    const existingItem = acc.find(cartItem => cartItem.item_name === item.item_name);
    if (existingItem) {
      return acc.map(cartItem =>
        cartItem.item_name === item.item_name
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      );
    }
    return [...acc, item];
  }, []);

  // Calculate total amount
  const totalAmount = updatedCartItems.reduce((total, item) => total + item.item_price * item.quantity, 0);

  return (
    <div className="cart-modal">
      <div className="modal-content">
        <h2>Cart Items</h2>
        {updatedCartItems.length > 0 ? (
          updatedCartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <img 
                src={item.item_image_url || 'default-image.jpg'} 
                alt={item.item_name} 
                className="cart-item-image" 
              />
              <div className="cart-item-details">
                <p>{item.item_name}</p>
                <p>Ksh {item.item_price.toFixed(2)}</p>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
                </div>
                <button className="remove-button" onClick={() => removeItem(item)}>Remove</button>
              </div>
            </div>
          ))
        ) : (
          <p>Hi, {username}, your cart is empty. Please add items!</p>
        )}
        
        <h3>Total: Ksh {totalAmount.toFixed(2)}</h3>
        
        <div className="cart-actions">
          <button className="close-button" onClick={onClose}>Close</button>
          {updatedCartItems.length > 0 && (
            <button className="checkout-button" onClick={() => proceedToCheckout(updatedCartItems, totalAmount)}>
              Proceed to Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;