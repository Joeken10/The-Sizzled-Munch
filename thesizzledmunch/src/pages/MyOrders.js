import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import './MyOrders.css';

function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:8000/orders/${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch orders');
          return res.json();
        })
        .then((data) => {
          setOrders(data.active_orders);
          setConfirmedOrders(data.history_orders);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to fetch orders. Try again later.');
          setLoading(false);
        });
    }
  }, [user]);

  const handleConfirmReceived = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:8000/orders/${user.id}/confirm/${orderId}`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to confirm order');

      const confirmedOrder = orders.find((o) => o.id === orderId);
      if (confirmedOrder) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
        setConfirmedOrders((prev) => [...prev, confirmedOrder]);
      }
    } catch (err) {
      console.error('Error confirming order:', err);
    }
  };

  if (!user) return <p>Please sign in to view your orders.</p>;
  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="error">{error}</p>;

  const hasPendingOrders = orders.some((order) => order.status !== 'Completed');

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {hasPendingOrders && (
        <div className="warning-banner">
          ⚠️ You have active orders that are still in progress. 
          Please wait until they are marked as <strong>Completed</strong> before confirming.
        </div>
      )}

      {orders.length === 0 ? (
        <p>No active orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <h3>Order #{order.id}</h3>
            <p><strong>Total:</strong> ksh. {order.total_amount}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.item_name} x {item.quantity} — ksh. {item.price}
                </li>
              ))}
            </ul>
            <div className="status-progress">
              {['Pending', 'Preparing', 'Ready', 'Completed'].map((stage) => (
                <div
                  key={stage}
                  className={`stage ${
                    stage === order.status ||
                    (stage === 'Pending' && ['Preparing', 'Ready', 'Completed'].includes(order.status)) ||
                    (stage === 'Preparing' && ['Ready', 'Completed'].includes(order.status)) ||
                    (stage === 'Ready' && order.status === 'Completed')
                      ? 'completed'
                      : ''
                  }`}
                >
                  {stage}
                </div>
              ))}
            </div>

            {order.status === 'Completed' && (
              <button className="confirm-btn" onClick={() => handleConfirmReceived(order.id)}>
                Confirm Received
              </button>
            )}
          </div>
        ))
      )}

      {confirmedOrders.length > 0 && (
        <>
          <h2>Past Orders</h2>
          {confirmedOrders.map((order) => (
            <div key={order.id} className="order-card history">
              <h3>Order #{order.id} (History)</h3>
              <p><strong>Total:</strong> ksh. {order.total_amount}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.item_name} x {item.quantity} — ksh. {item.price}
                  </li>
                ))}
              </ul>
              <p className="history-note">You have received this order in good condition.</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default MyOrders;
