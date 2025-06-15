import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './CartPage.css';

function CartPage({ cart, setCart }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const formatCurrency = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Fetch cart items for the logged-in user
  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:5000/cart_items?userId=${user.id}`)
      .then((res) => res.json())
      .then(setCart)
      .catch((err) => console.error('Error fetching cart:', err));
  }, [user?.id, setCart]);

  // Quantity updater
  const updateQuantity = async (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.min(10, Math.max(1, (item.quantity || 1) + delta));
    if (newQuantity === item.quantity) return;

    const updatedItem = { ...item, quantity: newQuantity };

    try {
      await fetch(`http://localhost:5000/cart_items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      setCart((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Remove item confirmation
  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setConfirmOpen(true);
  };

  const handleRemoveConfirmed = async () => {
    if (!itemToRemove) return;

    try {
      await fetch(`http://localhost:5000/cart_items/${itemToRemove.id}`, {
        method: 'DELETE',
      });
      setCart((prev) => prev.filter((i) => i.id !== itemToRemove.id));
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      closeConfirm();
    }
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  // Price calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );
  const basePrice = subtotal / 1.18;
  const vat = Math.round(basePrice * 0.16);
  const ctl = Math.round(basePrice * 0.02);

  return (
    <main className="cart-page-container" aria-label="Shopping Cart">
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => (
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

                <span className="item-price">
                  ksh. {formatCurrency(item.price || 0)}
                </span>

                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{item.quantity || 1}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveClick(item)}
                  aria-label={`Remove ${item.itemName || 'item'}`}
                >
                  Remove
                </button>
              </li>
            ))}
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
              type="button"
              className="add-more-btn"
              onClick={() => navigate('/menu')}
            >
              ADD MORE ITEMS
            </button>

            <button
              type="button"
              className="checkout-btn"
              onClick={() => navigate('/checkout')}
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
              Are you sure you want to remove{' '}
              <strong>{itemToRemove?.itemName || 'this item'}</strong> from your
              cart?
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
                type="button"
                onClick={handleRemoveConfirmed}
                className="confirm-btn"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={closeConfirm}
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
