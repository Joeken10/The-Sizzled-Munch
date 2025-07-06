import React, { useState } from 'react';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div style={{ background: '#222', color: '#fff', padding: '2rem', textAlign: 'center' }}>
      <h5 style={{ marginBottom: '0.5rem' }}>The Sizzled Munch</h5>
      <p style={{ marginBottom: '1rem' }}>Serving sizzling flavors every day.</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px' }}>
          <img src="/icons/facebook-svgrepo-com.svg" alt="Facebook" style={{ width: 24, height: 24 }} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px' }}>
          <img src="/icons/instagram-svgrepo-com.svg" alt="Instagram" style={{ width: 24, height: 24 }} />
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px' }}>
          <img src="/icons/tiktok-svgrepo-com.svg" alt="TikTok" style={{ width: 24, height: 24 }} />
        </a>
        <a href="https://wa.me/your-number" target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px' }}>
          <img src="/icons/whatsapp-svgrepo-com.svg" alt="WhatsApp" style={{ width: 24, height: 24 }} />
        </a>
      </div>

      <h6 style={{ marginBottom: '0.5rem' }}>Join our email list</h6>
      {subscribed ? (
        <p style={{ color: 'lightgreen' }}>Thank you for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.5rem', width: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', border: 'none', background: '#fff', color: '#222', borderRadius: '4px', cursor: 'pointer' }}>
            SUBSCRIBE
          </button>
          <small style={{ color: '#aaa', maxWidth: '300px' }}>
            By clicking "SUBSCRIBE" I agree to receive news, promotions, and offers from The Sizzled Munch.
          </small>
        </form>
      )}

      <small style={{ display: 'block', marginTop: '2rem', color: '#888' }}>
        &copy; {new Date().getFullYear()} The Sizzled Munch. All rights reserved.
      </small>
    </div>
  );
}

export default Footer;
