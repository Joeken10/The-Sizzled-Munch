import React, { useEffect, useState } from 'react';
import './AdminOrders.css';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/orders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.active_orders);
        setHistoryOrders(data.history_orders);
      })
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
        toast.error('Failed to load orders.');
      });
  }, []);

  const handleAdvanceStatus = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: data.new_status } : order
          )
        );
        toast.success(`Order #${orderId} advanced to ${data.new_status}`);
      } else {
        toast.error('Failed to advance status');
      }
    } catch (error) {
      console.error('Error advancing status:', error);
      toast.error('Network error while updating status');
    }
  };

  const handleAdminConfirm = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/confirm`, {
        method: 'PATCH',
      });

      if (res.ok) {
        const confirmedOrder = orders.find((o) => o.id === orderId);
        if (confirmedOrder) {
          setHistoryOrders((prev) => [...prev, confirmedOrder]);
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        }
        toast.success(`Order #${orderId} fully confirmed and archived`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to confirm order');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Network error while confirming order');
    }
  };

  const handleClearHistory = () => {
    const password = prompt('Enter Admin Password to Clear History:');
    if (password === 'adminpassword123') {
      setHistoryOrders([]);
      toast.success('Order history cleared (local only)');
    } else {
      toast.error('Incorrect password. Action canceled.');
    }
  };

  const renderProgress = (status) => {
    const stages = ['Pending', 'Preparing', 'Ready', 'Completed'];
    return (
      <div className="status-progress">
        {stages.map((stage) => (
          <div
            key={stage}
            className={`stage ${stage.toLowerCase()} ${
              stages.slice(0, stages.indexOf(status) + 1).includes(stage)
                ? 'completed'
                : ''
            }`}
          >
            {stage}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="orders-container">
      <h2>All Orders (Admin View)</h2>

      {orders.length === 0 ? (
        <p>No active orders found.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>Order #{order.id}</h3>
              <p><strong>User:</strong> {order.user.username}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ksh. {order.total_amount}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>

              <h4>Items:</h4>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.item_name} x {item.quantity} — ksh. {item.price}
                  </li>
                ))}
              </ul>

              {renderProgress(order.status)}

              {order.status !== 'Completed' ? (
                <button
                  className="advance-btn"
                  onClick={() => handleAdvanceStatus(order.id)}
                >
                  Move to Next Stage
                </button>
              ) : !order.admin_confirmed ? (
                <button
                  className="confirm-btn"
                  onClick={() => handleAdminConfirm(order.id)}
                >
                  Finalize Order (Admin)
                </button>
              ) : (
                <p className="info">Order Fully Confirmed</p>
              )}
            </div>
          ))}
        </div>
      )}

      {historyOrders.length > 0 && (
        <>
          <h2>Delivered Orders (History)</h2>
          <button className="clear-history-btn" onClick={handleClearHistory}>
            Clear All History
          </button>
          <div className="orders-grid">
            {historyOrders.map((order) => (
              <div key={order.id} className="order-card history">
                <h3>Order #{order.id} (History)</h3>
                <p><strong>User:</strong> {order.user.username}</p>
                <p><strong>Total:</strong> ksh. {order.total_amount}</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.item_name} x {item.quantity} — ksh. {item.price}
                    </li>
                  ))}
                </ul>
                <p className="history-note">
                  {order.user.username} has received their items in good state.
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminOrders;
