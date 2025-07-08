import React, { useState, useRef, useContext, useEffect } from 'react';
import './CheckoutPage.css';
import { useNavigate } from 'react-router-dom';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { AuthContext } from '../App';
import { toast } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
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
    phone: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const formatCurrency = (num) => num.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    if (formData.paymentMethod === 'MPesa' && !/^2547\d{8}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Valid MPesa phone number required';
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

  const pollPaymentStatus = async (transactionId) => {
    let attempts = 0;
    const maxAttempts = 12;
    setPolling(true);
    const intervalId = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_BASE_URL}/mpesa/payment_status_by_txn/${transactionId}`);
        const data = await res.json();
        if (data.status === 'Success') {
          clearInterval(intervalId);
          setPolling(false);
          toast.success('MPesa payment confirmed.');
          await placeOrder(transactionId);
        } else if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setPolling(false);
          setLoading(false);
          toast.error('Payment confirmation timeout.');
        }
      } catch (error) {
        console.error(error);
      }
    }, 5000);
  };

  const processPayment = async () => {
    const totalAmount = Math.round(cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0));

    if (formData.paymentMethod === 'MPesa') {
      try {
        const res = await fetch(`${API_BASE_URL}/pay_mpesa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_number: formData.phone,
            amount: totalAmount,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('MPesa payment initiated.');
          pollPaymentStatus(data.transaction_id);
          return { success: 'pending', transactionId: data.transaction_id };
        } else {
          toast.error(data.error);
          return { success: false };
        }
      } catch (err) {
        console.error(err);
        toast.error('Payment failed.');
        return { success: false };
      }
    } else {
      toast.info(`${formData.paymentMethod} simulated payment`);
      return { success: true, transactionId: `${formData.paymentMethod}_TXN_${Date.now()}` };
    }
  };

  const placeOrder = async (transactionId) => {
    try {
      const orderRes = await fetch(`${API_BASE_URL}/orders`, {
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
          transaction_id: transactionId,
        }),
      });
      const orderData = await orderRes.json();

      await fetch(`${API_BASE_URL}/clear_cart/${user.id}`, { method: 'DELETE' });

      setOrderSnapshot({
        orderId: orderData.order_id,
        items: cart,
        customer: { ...formData },
        date: new Date().toLocaleString(),
      });

      setSubmitted(true);
      setCart([]);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error(error);
      toast.error('Order placement failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const paymentResult = await processPayment();
    if (paymentResult.success === true) {
      await placeOrder(paymentResult.transactionId);
    } else if (paymentResult.success === false) {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    const { customer, items, orderId, date } = orderSnapshot;
    let receipt = `Order ID: ${orderId}\nDate: ${date}\n\nCustomer:\n`;
    receipt += `Name: ${customer.name}\nEmail: ${customer.email}\nAddress: ${customer.address}\nPayment Method: ${customer.paymentMethod}\n\nItems:\n`;
    items.forEach(item => {
      receipt += `- ${item.item_name} x ${item.quantity} = ksh. ${formatCurrency(item.price * item.quantity)}\n`;
    });
    const blob = new Blob([receipt], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipt_${orderId}.txt`;
    link.click();
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
    <main className="checkout-page">
      {!submitted ? (
        <>
          <h2>Checkout</h2>
          <section className="checkout-summary">
            <h3>Order Summary</h3>
            <ul>
              {cart.map(item => (
                <li key={item.id}>
                  {item.item_name} x {item.quantity} — ksh. {formatCurrency(item.price * item.quantity)}
                </li>
              ))}
            </ul>
            <p><strong>Total: ksh. {formatCurrency(cart.reduce((acc, item) => acc + item.price * item.quantity, 0))}</strong></p>
          </section>

          <LoadScript googleMapsApiKey={GOOGLE_API_KEY} libraries={libraries}>
            <form className="checkout-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Full Name:</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input name="email" value={formData.email} onChange={handleChange} required />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Delivery Address:</label>
                <Autocomplete onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={onPlaceChanged}>
                  <input name="address" value={formData.address} onChange={handleChange} required />
                </Autocomplete>
                {errors.address && <span className="error">{errors.address}</span>}
              </div>
              <div className="form-group">
                <label>Payment Method:</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                  <option value="">Select</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                {errors.paymentMethod && <span className="error">{errors.paymentMethod}</span>}
              </div>
              {formData.paymentMethod === 'MPesa' && (
                <div className="form-group">
                  <label>Phone Number:</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} placeholder="2547XXXXXXXX" required />
                  {errors.phone && <span className="error">{errors.phone}</span>}
                </div>
              )}
              <button type="submit" disabled={loading || polling}>
                {loading || polling ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </LoadScript>
        </>
      ) : (
        <section className="order-confirmation">
          <FaCheckCircle size={80} color="green" />
          <h2>Thank you for your order!</h2>
          <button onClick={downloadReceipt}>Download Receipt</button>
          <button onClick={() => navigate('/menu')}>Back to Menu</button>
        </section>
      )}
    </main>
  );
}

export default CheckoutPage;
