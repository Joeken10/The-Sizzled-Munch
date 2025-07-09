import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import './MyOrders.css';
import { toast } from 'react-toastify';  

const API_BASE_URL = 'http://localhost:8000';

function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState({ active: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !user.id) {
      console.warn("User not logged in or missing ID");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${user.id}/orders`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
        const data = await res.json();
        console.log("Fetched Orders:", data);
        setOrders({
          active: data.active_orders || [],
          history: data.history_orders || [],
        });
      } catch (err) {
        console.error('Fetch Orders Error:', err);
        setError('Failed to fetch orders. Please try again later.');
        toast.error('Failed to fetch orders.');  // ✅ Toast on fetch error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleConfirmReceived = async (orderId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/orders/${user.id}/confirm/${orderId}`,
        { method: 'PATCH', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to confirm order');

      setOrders((prev) => {
        const confirmedOrder = prev.active.find((order) => order.id === orderId);
        if (!confirmedOrder) return prev;
        return {
          active: prev.active.filter((order) => order.id !== orderId),
          history: [...prev.history, confirmedOrder],
        };
      });

      toast.success(`Order #${orderId} confirmed successfully.`);  // ✅ Toast on success
    } catch (err) {
      console.error('Error confirming order:', err);
      toast.error(err.message || 'Failed to confirm order.');  // ✅ Toast on error
    }
  };

  if (!user || !user.id) {
    return <p>Please sign in to view your orders.</p>;
  }

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  const hasPendingOrders = orders.active.some((order) => order.status !== 'Completed');

  const renderOrderCard = (order, isHistory = false) => (
    <div key={order.id} className={`order-card ${isHistory ? 'history' : ''}`}>
      <h3>Order #{order.id} {isHistory ? '(History)' : ''}</h3>
      <p><strong>Total:</strong> ksh. {order.total_amount}</p>
      <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.item_name} x {item.quantity} — ksh. {item.price}
          </li>
        ))}
      </ul>

      {!isHistory && (
        <>
          <div className="status-progress">
            {['Pending', 'Preparing', 'Ready', 'Completed'].map((stage) => (
              <div
                key={stage}
                className={`stage ${
                  ['Pending', 'Preparing', 'Ready', 'Completed']
                    .slice(0, ['Pending', 'Preparing', 'Ready', 'Completed'].indexOf(order.status) + 1)
                    .includes(stage)
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
        </>
      )}

      {isHistory && (
        <p className="history-note">You have received this order in good condition.</p>
      )}
    </div>
  );

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {hasPendingOrders && (
        <div className="warning-banner">
          ⚠️ You have active orders still in progress. Please wait until they are marked as{' '}
          <strong>Completed</strong> before confirming.
        </div>
      )}

      {orders.active.length === 0 && orders.history.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          {orders.active.length > 0 && (
            <>
              <h3>Active Orders ({orders.active.length})</h3>
              {orders.active.map((order) => renderOrderCard(order))}
            </>
          )}

          {orders.history.length > 0 && (
            <>
              <h3>Past Orders</h3>
              {orders.history.map((order) => renderOrderCard(order, true))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default MyOrders;
