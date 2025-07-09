import React from 'react';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header
        className="hero"
        style={{
          backgroundImage: `linear-gradient(
            rgba(59, 46, 15, 0.8),
            rgba(59, 46, 15, 0.8)
          ), url('/landing-page-images/2photo.jpeg')`,
        }}
      >
        <div className="hero-content">
          <h1 className="title">The Sizzled Munch</h1>
          <p className="subtitle">
            Where classic flavors meet timeless elegance.
          </p>
          <a href="/menu" className="btn-primary" aria-label="View our menu">
            View Our Menu
          </a>
        </div>
      </header>

      <section className="about">
        <h2>About Us</h2>
        <p>
          At The Sizzled Munch, we combine gourmet tradition with exquisite taste to bring you an unforgettable dining experience. Our chefs use only the finest ingredients, prepared with passion and precision.
        </p>
      </section>
    </div>
  );
}

export default LandingPage;
