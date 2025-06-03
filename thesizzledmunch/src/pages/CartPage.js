import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "./CartPage.css";

function CartPage({ cart, setCart }) {
  const { user } = useContext(AuthContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  const getHeaders = () => ({
    "Content-Type": "application/json",
  });

  const fetchCart = useCallback(() => {
    if (!user) {
      setCart([]);
      return;
    }

    fetch(`http://localhost:8000/cart`, {
      headers: getHeaders(),
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCart(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching cart:", err);
        setCart([]);
        if (err.message.includes("Unauthorized")) {
          navigate("/login");
        }
      });
  }, [user, setCart, navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setConfirmOpen(true);
  };

  const handleRemoveConfirmed = async () => {
    if (!itemToRemove) return;

    try {
      const res = await fetch(`http://localhost:8000/cart/${itemToRemove.id}`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include",
      });

      if (res.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);

      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
      if (error.message.includes("Unauthorized")) {
        navigate("/login");
      }
    } finally {
      setConfirmOpen(false);
      setItemToRemove(null);
    }
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  const handleQuantityChange = async (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, Math.min((item.quantity || 1) + delta, 10));

    try {
      const res = await fetch(`http://localhost:8000/cart/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ quantity: newQuantity }),
        credentials: "include",
      });

      if (res.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }
      if (!res.ok) throw new Error(`Failed to update: ${res.status}`);

      await fetchCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      if (error.message.includes("Unauthorized")) {
        navigate("/login");
      }
    }
  };

  // Calculate totals
  const totalWithTaxes = Array.isArray(cart)
    ? cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0)
    : 0;

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

      {!Array.isArray(cart) || cart.length === 0 ? (
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
                      alt={item.item_name}
                      className="cart-item-image"
                    />
                  )}
                  <span className="item-name">{item.item_name}</span>
                </div>

                <span className="item-price">ksh. {formatCurrency(item.price)}</span>

                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    type="button"
                    aria-label={`Decrease quantity of ${item.item_name}`}
                  >
                    -
                  </button>
                  <span>{item.quantity || 1}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    type="button"
                    aria-label={`Increase quantity of ${item.item_name}`}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveClick(item)}
                  type="button"
                  aria-label={`Remove ${item.item_name} from cart`}
                  className="remove-btn"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <section className="cart-totals" aria-live="polite">
            <p>Subtotal: ksh. {formatCurrency(subtotal)}</p>
            <p>VAT (16%): ksh. {formatCurrency(vat)}</p>
            <p>CTL (2%): ksh. {formatCurrency(ctl)}</p>
            <hr />
            <p>
              <strong>Total: ksh. {formatCurrency(totalWithTaxes)}</strong>
            </p>
          </section>
        </>
      )}

      {confirmOpen && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="modal-content">
            <h3 id="confirm-title">Confirm Remove Item</h3>
            <p>
              Are you sure you want to remove{" "}
              <strong>{itemToRemove?.item_name}</strong> from your cart?
            </p>
            <button onClick={handleRemoveConfirmed} autoFocus>
              Yes, Remove
            </button>
            <button onClick={closeConfirm}>Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default CartPage;
