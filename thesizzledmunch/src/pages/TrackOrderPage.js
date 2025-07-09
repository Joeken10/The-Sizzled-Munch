import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function TrackOrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        if (!res.ok) {
          throw new Error('Order not found or server error.');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <p>Loading your order details...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (!order) {
    return <p>Order not found.</p>;
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
              {item.item_name} x {item.quantity} — Ksh {Number(item.price).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No items found for this order.</p>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
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
