import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

function CartPage({ cart, setCart }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setConfirmOpen(true);
  };

  const handleRemoveConfirmed = () => {
    if (itemToRemove) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemToRemove.id));
    }
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  const handleIncrease = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min((item.quantity || 1) + 1, 10) }
          : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) }
          : item
      )
    );
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
