import React, { useState, useRef } from 'react';
import './CheckoutPage.css';
import { useNavigate } from 'react-router-dom';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY; // from .env
const libraries = ['places'];

const paymentMethods = [
  'MPesa', 'Credit Card', 'Debit Card', 'PayPal',
  'Apple Pay', 'Google Pay', 'Bank Transfer',
  'Cash on Delivery', 'Cryptocurrency', 'Gift Card',
];

function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    paymentMethod: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Snapshot cart and form data before clearing
    setOrderSnapshot({
      items: cart.map(item => ({
        id: item.id,
        name: item.itemName,
        quantity: item.quantity || 1,
        price: item.price,
        subtotal: item.price * (item.quantity || 1),
      })),
      total: cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0),
      customer: { ...formData },
      date: new Date().toLocaleString(),
    });

    setSubmitted(true);
    setCart([]); // clear cart after snapshot
  };

  const downloadReceipt = () => {
    if (!orderSnapshot) return;

    const { customer, items, total, date } = orderSnapshot;

    let receiptText = '';
    receiptText += '*** RECEIPT ***\n';
    receiptText += `Date: ${date}\n\n`;

    receiptText += 'Customer Details:\n';
    receiptText += `Name: ${customer.name}\n`;
    receiptText += `Email: ${customer.email}\n`;
    receiptText += `Address: ${customer.address}\n`;
    receiptText += `Payment Method: ${customer.paymentMethod}\n\n`;

    receiptText += 'Order Items:\n';
    items.forEach(item => {
      receiptText += `- ${item.name} x ${item.quantity} @ ksh. ${formatCurrency(item.price)} each = ksh. ${formatCurrency(item.subtotal)}\n`;
    });

    receiptText += `\nTotal: ksh. ${formatCurrency(total)}\n`;
    receiptText += '\nThank you for your purchase!\n';

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!submitted && cart.length === 0) {
    return (
      <main className="checkout-page">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/menu')}>Go to Menu</button>
      </main>
    );
  }

  return (
    <main className="checkout-page" aria-label="Checkout Page">
      {!submitted ? (
        <>
          <h2>Checkout</h2>

          <section className="checkout-summary">
            <h3>Order Summary</h3>
            <ul>
              {cart.map(item => (
                <li key={item.id}>
                  {item.itemName} x {item.quantity || 1} — ksh.{' '}
                  {formatCurrency(item.price * (item.quantity || 1))}
                </li>
              ))}
            </ul>
            <p><strong>Total: ksh. {formatCurrency(cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0))}</strong></p>
          </section>

          <LoadScript googleMapsApiKey={GOOGLE_API_KEY} libraries={libraries}>
            <form className="checkout-form" onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div>
                <label htmlFor="name">Full Name:</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="John Doe"
                  aria-describedby="name-error"
                />
                {errors.name && <span id="name-error" className="error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="example@mail.com"
                  aria-describedby="email-error"
                />
                {errors.email && <span id="email-error" className="error">{errors.email}</span>}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address">Delivery Address:</label>
                <Autocomplete
                  onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    type="text"
                    placeholder="Start typing your address"
                    required
                    aria-describedby="address-error"
                  />
                </Autocomplete>
                {errors.address && <span id="address-error" className="error">{errors.address}</span>}
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod">Payment Method:</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  aria-describedby="payment-error"
                >
                  <option value="">Select a payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <span id="payment-error" className="error">{errors.paymentMethod}</span>
                )}
              </div>

              <button type="submit">Place Order</button>
            </form>
          </LoadScript>
        </>
      ) : (
        <section className="order-confirmation">
          <h2>Thank you for your order!</h2>
          <p>Your order has been placed successfully and is being processed.</p>

          <section className="receipt-details" style={{ marginTop: '1.5rem' }}>
            <h3>Order Summary</h3>
            <p><strong>Order Date:</strong> {orderSnapshot.date}</p>

            <h4>Customer Details</h4>
            <p>Name: {orderSnapshot.customer.name}</p>
            <p>Email: {orderSnapshot.customer.email}</p>
            <p>Address: {orderSnapshot.customer.address}</p>
            <p>Payment Method: {orderSnapshot.customer.paymentMethod}</p>

            <h4>Items Ordered:</h4>
            <ul>
              {orderSnapshot.items.map(item => (
                <li key={item.id}>
                  {item.name} x {item.quantity} @ ksh. {formatCurrency(item.price)} each = ksh. {formatCurrency(item.subtotal)}
                </li>
              ))}
            </ul>
            <p><strong>Total: ksh. {formatCurrency(orderSnapshot.total)}</strong></p>
          </section>

          <button onClick={downloadReceipt} style={{ marginRight: '1rem' }}>
            Download Receipt
          </button>
          <button onClick={() => navigate('/menu')}>
            Back to Menu
          </button>
        </section>
      )}
    </main>
  );
}

export default CheckoutPage;
