import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './CartPage.css';

function CartPage({ cart, setCart }) {
  const { user } = useContext(AuthContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  // Fetch user's cart
  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/cartItems?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setCart(data))
        .catch((err) => console.error('Error fetching cart:', err));
    }
  }, [user, setCart]);

  // Remove item flow
  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setConfirmOpen(true);
  };

  const handleRemoveConfirmed = async () => {
    if (!itemToRemove) return;

    try {
      await fetch(`http://localhost:5000/cartItems/${itemToRemove.id}`, {
        method: 'DELETE',
      });
      setCart((prev) => prev.filter((item) => item.id !== itemToRemove.id));
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setConfirmOpen(false);
      setItemToRemove(null);
    }
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  // Update item quantity
  const updateQuantity = async (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, Math.min(10, (item.quantity || 1) + delta));
    const updatedItem = { ...item, quantity: newQuantity };

    try {
      await fetch(`http://localhost:5000/cartItems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });

      setCart((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Price Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const basePrice = subtotal / 1.18;
  const vat = Math.round(basePrice * 0.16);
  const ctl = Math.round(basePrice * 0.02);
  const formatCurrency = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Render
  return (
    <main className="cart-page-container" aria-label="Shopping Cart">
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => {
              const quantity = item.quantity || 1;
              return (
                <li key={item.id} className="cart-item">
                  <div className="item-details">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.itemName || 'Cart item'}
                        className="cart-item-image"
                      />
                    )}
                    <span className="item-name">{item.itemName}</span>
                  </div>

                  <span className="item-price">ksh. {formatCurrency(item.price)}</span>

                  <div className="quantity-controls" aria-label="Item quantity controls">
                    <button onClick={() => updateQuantity(item.id, -1)} type="button" aria-label="Decrease quantity">−</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} type="button" aria-label="Increase quantity">+</button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveClick(item)}
                    type="button"
                    aria-label={`Remove ${item.itemName}`}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <section className="summary" aria-label="Price Summary">
            <div className="summary-row">
              <span>SUB TOTAL :</span>
              <span>ksh. {formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>VAT 16% :</span>
              <span>ksh. {formatCurrency(vat)}</span>
            </div>
            <div className="summary-row">
              <span>CTL 2% :</span>
              <span>ksh. {formatCurrency(ctl)}</span>
            </div>
            <div className="summary-row total">
              <strong>TOTAL :</strong>
              <strong>ksh. {formatCurrency(subtotal)}</strong>
            </div>
          </section>

          <p className="delivery-note">
            * Delivery charges will be applicable based on your chosen address
          </p>

          <div className="cart-buttons">
            <button
              className="add-more-btn"
              onClick={() => navigate('/menu')}
              type="button"
            >
              ADD MORE ITEMS
            </button>

            <button
              className="checkout-btn"
              onClick={() => navigate('/checkout')}
              type="button"
              disabled={cart.length === 0}
            >
              CHECKOUT
            </button>
          </div>
        </>
      )}

      {confirmOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmTitle"
          aria-describedby="confirmDesc"
        >
          <div className="modal-content">
            <h3 id="confirmTitle">Confirm Removal</h3>
            <p id="confirmDesc">
              Are you sure you want to remove "<strong>{itemToRemove?.itemName}</strong>" from your cart?
            </p>

            {itemToRemove?.image && (
              <img
                src={itemToRemove.image}
                alt={itemToRemove.itemName || 'Item to remove'}
                className="confirm-item-image"
              />
            )}

            <div className="modal-buttons">
              <button
                onClick={handleRemoveConfirmed}
                type="button"
                className="confirm-btn"
              >
                Yes
              </button>
              <button
                onClick={closeConfirm}
                type="button"
                className="cancel-btn"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CartPage;
