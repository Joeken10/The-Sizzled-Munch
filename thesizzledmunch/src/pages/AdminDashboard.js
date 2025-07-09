import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/analytics`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load analytics', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const [salesCount, setSalesCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (stats) {
      let sales = 0;
      let orders = 0;
      const salesTarget = stats.total_sales;
      const ordersTarget = stats.total_orders;

      const interval = setInterval(() => {
        sales += Math.ceil(salesTarget / 30);
        orders += Math.ceil(ordersTarget / 30);

        if (sales >= salesTarget && orders >= ordersTarget) {
          setSalesCount(salesTarget);
          setOrdersCount(ordersTarget);
          clearInterval(interval);
        } else {
          setSalesCount(Math.min(sales, salesTarget));
          setOrdersCount(Math.min(orders, ordersTarget));
        }
      }, 40);

      return () => clearInterval(interval);
    }
  }, [stats]);

  if (!stats) return <p>Loading analytics...</p>;

  const maxSold = stats.most_popular_items[0]?.sold || 1;

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
      <div className="dashboard-header">
        <h2>Sales Analytics</h2>
        <button onClick={() => setDarkMode(!darkMode)} className="mode-toggle">
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h4>Total Sales</h4>
          <p>ksh. {salesCount.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p>{ordersCount}</p>
        </div>
      </div>

      <h3>Top Selling Items</h3>
      <ul>
        {stats.most_popular_items.map((item, idx) => (
          <li key={idx}>
            <div className="bar-container">
              <div
                className={`bar bar-${idx}`}
                style={{
                  width: `${(item.sold / maxSold) * 100}%`
                }}
              >
                {item.item} — Sold: {item.sold}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
