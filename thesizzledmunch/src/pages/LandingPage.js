import React from 'react';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="hero">
        <div className="hero-content">
          <h1 className="title animate-fade-in">The Sizzled Munch</h1>
          <p className="subtitle animate-slide-up">
            Where classic flavors meet timeless elegance.
          </p>
          <a href="/menu" className="btn-primary btn-glow" aria-label="View our menu">
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
