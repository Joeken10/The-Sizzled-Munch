import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePages from './pages/HomePages';
import MenuList from './pages/MenuList';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage'; // Import CheckoutPage
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const [cart, setCart] = useState([]);

  return (
    <BrowserRouter>
      <Navbar cartItemCount={cart.length} />
      <Routes>
        <Route path="/" element={<HomePages />} />
        <Route path="/menu" element={<MenuList cart={cart} setCart={setCart} />} />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} /> {/* Add this */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
