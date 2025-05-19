import React from 'react';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <header className="hero-section">
        <div className="overlay">
          <div className="hero-content">
            <h1 className="hero-title">The Sizzled Munch </h1>
            <p className="hero-tagline">Bold, sizzling flavors that ignite your cravings.</p>
            <a href="/menu" className="cta-button">Explore Menu</a>
          </div>
        </div>
      </header>

      {/* GALLERY SECTION */}
      <section className="gallery-section">
        <h2 className="gallery-heading"> Our Signature Bites </h2>
        <p className="gallery-subtext">A taste of what’s hot and happening in our kitchen</p>
        <div className="photo-carousel">
          <div className="photo-slide">
            
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
