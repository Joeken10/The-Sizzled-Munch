import React, { useState, useRef, useContext } from 'react';
import './CheckoutPage.css';
import { useNavigate } from 'react-router-dom';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { AuthContext } from '../App';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const libraries = ['places'];
const paymentMethods = ['MPesa', 'Stripe', 'PayPal'];

function CheckoutPage({ cart, setCart }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    paymentMethod: '',
    phone: '',  // ✅ Phone number for MPesa
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderSnapshot, setOrderSnapshot] = useState(null);

  const formatCurrency = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z]+(?: [a-zA-Z]+)+$/.test(formData.name.trim())) {
      newErrors.name = 'Please enter your full name (first and last)';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    if (formData.paymentMethod === 'MPesa') {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required for MPesa';
      } else if (!/^2547\d{8}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Phone number must start with 2547 and be 12 digits';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place?.formatted_address) {
        setFormData((prev) => ({ ...prev, address: place.formatted_address }));
        setErrors((prev) => ({ ...prev, address: undefined }));
      }
    }
  };

  const processPayment = async () => {
    if (formData.paymentMethod === 'MPesa') {
      try {
        const res = await fetch('http://localhost:8000/pay_mpesa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_number: formData.phone,
            amount: cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          alert('MPesa payment initiated. Complete payment on your phone.');
          return { success: true, transactionId: data.transaction_id };
        } else {
          alert('MPesa payment failed: ' + data.error);
          return { success: false };
        }
      } catch (error) {
        console.error('MPesa Error:', error);
        alert('Failed to initiate MPesa payment.');
        return { success: false };
      }
    } else if (formData.paymentMethod === 'Stripe') {
      alert('Simulating Stripe payment...');
      return { success: true, transactionId: 'STRIPE_TXN_12345' };
    } else if (formData.paymentMethod === 'PayPal') {
      alert('Simulating PayPal payment...');
      return { success: true, transactionId: 'PAYPAL_TXN_67890' };
    } else {
      return { success: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const paymentResult = await processPayment();
    if (!paymentResult.success) return;

    const snapshotItems = cart.map(item => ({
      id: item.id,
      name: item.item_name,
      quantity: item.quantity || 1,
      price: item.price,
      subtotal: item.price * (item.quantity || 1),
    }));

    const subtotal = snapshotItems.reduce((acc, item) => acc + item.subtotal, 0);
    const basePrice = subtotal / 1.18;
    const vat = Math.round(basePrice * 0.16);
    const ctl = Math.round(basePrice * 0.02);
    const total = subtotal;

    try {
      await fetch('http://localhost:8000/cart_summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subtotal,
          vat,
          ctl,
          total,
        }),
      });

      const orderRes = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          items: cart.map(item => ({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity || 1,
            price: item.price,
          })),
          payment_method: formData.paymentMethod,
          transaction_id: paymentResult.transactionId,
        }),
      });

      const orderData = await orderRes.json();

      await fetch(`http://localhost:8000/clear_cart/${user.id}`, {
        method: 'DELETE',
      });

      setOrderSnapshot({
        orderId: orderData.order_id,
        items: snapshotItems,
        total,
        subtotal,
        vat,
        ctl,
        customer: { ...formData },
        date: new Date().toLocaleString(),
      });

      setSubmitted(true);
      setCart([]);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const downloadReceipt = () => {
    if (!orderSnapshot) return;

    const { customer, items, total, subtotal, vat, ctl, date, orderId } = orderSnapshot;

    let receiptText = '*** RECEIPT ***\n';
    receiptText += `Order ID: ${orderId}\n`;
    receiptText += `Date: ${date}\n\n`;

    receiptText += 'Customer Details:\n';
    receiptText += `Name: ${customer.name}\n`;
    receiptText += `Email: ${customer.email}\n`;
    receiptText += `Address: ${customer.address}\n`;
    receiptText += `Payment Method: ${customer.paymentMethod}\n\n`;

    receiptText += 'Order Items:\n';
    items.forEach(item => {
      receiptText += `- ${item.name} x ${item.quantity} @ ksh. ${formatCurrency(item.price)} = ksh. ${formatCurrency(item.subtotal)}\n`;
    });

    receiptText += `\nSubtotal: ksh. ${formatCurrency(subtotal)}\n`;
    receiptText += `VAT 16%: ksh. ${formatCurrency(vat)}\n`;
    receiptText += `CTL 2%: ksh. ${formatCurrency(ctl)}\n`;
    receiptText += `TOTAL: ksh. ${formatCurrency(total)}\n`;

    receiptText += '\nThank you for your purchase!\n';

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!submitted && cart.length === 0) {
    return (
      <main className="checkout-page">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/menu')} aria-label="Go to Menu">
          Go to Menu
        </button>
      </main>
    );
  }

  return (
    <main className="checkout-page" aria-label="Checkout Page">
      {!submitted ? (
        <>
          <h2>Checkout</h2>
          <section className="checkout-summary" aria-label="Order Summary">
            <h3>Order Summary</h3>
            <ul>
              {cart.map(item => (
                <li key={item.id}>
                  {item.item_name} x {item.quantity || 1} — ksh. {formatCurrency(item.price * (item.quantity || 1))}
                </li>
              ))}
            </ul>
            <p>
              <strong>
                Total: ksh. {formatCurrency(cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0))}
              </strong>
            </p>
          </section>

          <LoadScript googleMapsApiKey={GOOGLE_API_KEY} libraries={libraries}>
            <form className="checkout-form" onSubmit={handleSubmit} noValidate aria-label="Checkout form">
              <div className="form-group">
                <label htmlFor="name">Full Name:</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
                {errors.name && <span className="error" role="alert">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                {errors.email && <span className="error" role="alert">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="address">Delivery Address:</label>
                <Autocomplete onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={onPlaceChanged}>
                  <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} required />
                </Autocomplete>
                {errors.address && <span className="error" role="alert">{errors.address}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method:</label>
                <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                  <option value="">Select a payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                {errors.paymentMethod && <span className="error" role="alert">{errors.paymentMethod}</span>}
              </div>

              {formData.paymentMethod === 'MPesa' && (
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (MPesa):</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="2547XXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && <span className="error" role="alert">{errors.phone}</span>}
                </div>
              )}

              <button type="submit" className="submit-button">Place Order</button>
            </form>
          </LoadScript>
        </>
      ) : (
        <section className="order-confirmation" aria-live="polite">
          <h2>Thank you for your order!</h2>
          <p>Your order has been placed successfully and is being processed.</p>

          <button onClick={downloadReceipt} style={{ marginRight: '1rem' }}>Download Receipt</button>
          <button onClick={() => navigate('/menu')}>Back to Menu</button>
        </section>
      )}
    </main>
  );
}

export default CheckoutPage;
