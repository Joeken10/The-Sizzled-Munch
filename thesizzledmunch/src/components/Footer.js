import React from 'react';
import './Footer.css'; 

function Footer() {
  return (
    <footer className="footer bg-dark text-white py-4 mt-5">
      <div className="container text-center">
        <h5 className="mb-3">The Sizzled Munch</h5>
        <p className="mb-2">Serving sizzling flavors every day.</p>
        <div className="social-icons mb-3">
          <a href="fb" className="text-white mx-2">Facebook</a>
          <a href="ig" className="text-white mx-2">Instagram</a>
          <a href="x" className="text-white mx-2">Twitter</a>
        </div>
        <small>&copy; {new Date().getFullYear()} The Sizzled Munch. All rights reserved.</small>
      </div>
    </footer>
  );
}

export default Footer;
