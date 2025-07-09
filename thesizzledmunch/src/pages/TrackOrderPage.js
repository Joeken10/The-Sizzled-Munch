import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'https://the-sizzled-munch.onrender.com';

function TrackOrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Order not found or server error.');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error(err.message || 'Failed to fetch order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <p>Loading your order details...</p>;
  }

  if (!order) {
    return <p style={{ color: 'red' }}>Order not found or could not be loaded.</p>;
  }

  return (
    <main className="track-order-page" style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>🍔 Tracking Order #{order.id}</h2>
      <p><strong>Status:</strong> {order.status || 'Pending'}</p>
      <p><strong>Total Amount:</strong> Ksh {Number(order.total_amount).toLocaleString()}</p>

      <h3>Order Items:</h3>
      {order.items && order.items.length > 0 ? (
        <ul style={{ paddingLeft: '1.5rem' }}>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.item_name} × {item.quantity} — Ksh {Number(item.price).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No items found for this order.</p>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#d63447',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#fff',
            fontWeight: 'bold'
          }}>
            Back to Home
          </button>
        </Link>
      </div>
    </main>
  );
}

export default TrackOrderPage;
