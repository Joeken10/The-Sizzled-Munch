import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App'; 
import './CartPage.css';

function CartPage({ cart, setCart }) {
  const { user } = useContext(AuthContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/cart_item?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setCart(data))
        .catch((err) => console.error('Error fetching cart:', err));
    }
  }, [user, setCart]);

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setConfirmOpen(true);
  };

  const handleRemoveConfirmed = async () => {
    if (itemToRemove) {
      try {
        await fetch(`http://localhost:5000/cart_item/${itemToRemove.id}`, {
          method: 'DELETE',
        });

        setCart((prevCart) =>
          prevCart.filter((item) => item.id !== itemToRemove.id)
        );
      } catch (error) {
        console.error('Failed to remove item:', error);
      }
    }
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  const handleIncrease = async (id) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const updated = { ...item, quantity: Math.min((item.quantity || 1) + 1, 10) };

    try {
      await fetch(`http://localhost:5000/cart_item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      setCart((prevCart) => prevCart.map((i) => (i.id === id ? updated : i)));
    } catch (error) {
      console.error('Failed to increase quantity:', error);
    }
  };

  const handleDecrease = async (id) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const updated = { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) };

    try {
      await fetch(`http://localhost:000/cart_item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      setCart((prevCart) => prevCart.map((i) => (i.id === id ? updated : i)));
    } catch (error) {
      console.error('Failed to decrease quantity:', error);
    }
  };

  const totalWithTaxes = cart.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const basePrice = totalWithTaxes / 1.18;
  const vat = Math.round(basePrice * 0.16);
  const ctl = Math.round(basePrice * 0.02);
  const subtotal = totalWithTaxes;

  const formatCurrency = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

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
                        alt={item.itemName}
                        className="cart-item-image"
                      />
                    )}
                    <span className="item-name">{item.itemName}</span>
                  </div>

                  <span className="item-price">ksh. {formatCurrency(item.price)}</span>

                  <div className="quantity-controls">
                    <button onClick={() => handleDecrease(item.id)} type="button">-</button>
                    <span>{quantity}</span>
                    <button onClick={() => handleIncrease(item.id)} type="button">+</button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveClick(item)}
                    type="button"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <section className="summary">
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
                alt={itemToRemove.itemName}
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
