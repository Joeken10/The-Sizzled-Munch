import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import './MenuManagement.css';

function MenuManagement() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState({
    item_name: '',
    price: '',
    category: '',
    description: '',
    image_url: '',
    extras: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchMenuItems();
  }, [user, navigate]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('http://localhost:8000/menu_items');
      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.item_name || !form.price || !form.category) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    const url = editingId
      ? `http://localhost:8000/menu_items/${editingId}`
      : 'http://localhost:8000/menu_items';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, admin_id: user.id }),
      });

      if (res.ok) {
        fetchMenuItems();
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save item');
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      item_name: item.item_name,
      price: item.price,
      category: item.category,
      description: item.description,
      image: item.image,
      extras: item.extras,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      const res = await fetch(`http://localhost:8000/menu_items/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: user.id }),
      });

      if (res.ok) {
        fetchMenuItems();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const resetForm = () => {
    setForm({
      item_name: '',
      price: '',
      category: '',
      description: '',
      image: '',
      extras: '',
    });
    setEditingId(null);
  };

  return (
    <div className="menu-management">
      <h2>Menu Management</h2>

      <form onSubmit={handleSubmit} className="menu-form">
        <input
          type="text"
          placeholder="Item Name"
          value={form.item_name}
          onChange={(e) => setForm({ ...form, item_name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Image"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <input
          type="text"
          placeholder="Extras (comma-separated)"
          value={form.extras}
          onChange={(e) => setForm({ ...form, extras: e.target.value })}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="cancel-button"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="menu-list">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item">
            <h3>{item.item_name}</h3>
            <p><strong>Price:</strong> ksh. {item.price}</p>
            <p><strong>Category:</strong> {item.category}</p>
            {item.description && <p>{item.description}</p>}
            {item.image && (
              <img src={item.image} alt={item.item_name} className="menu-image" />
            )}
            {item.extras && (
              <p><strong>Extras:</strong> {item.extras}</p>
            )}
            <div className="actions">
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuManagement;