import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePages from './pages/HomePages';
import MenuList from './pages/MenuList';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MenuManagement from './pages/MenuManagement';
import AdminOrders from './pages/AdminOrders';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyOrders from './pages/MyOrders';

export const AuthContext = createContext();

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Navbar cartItemCount={cart.length} />
        <Routes>
          <Route path="/" element={<HomePages />} />
          <Route path="/menu" element={<MenuList cart={cart} setCart={setCart} />} />
          <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<UserProfile userId={user?.id} />} />
          
     
          <Route path="/my-orders" element={<MyOrders />} />
          
          <Route path="/forgot_password" element={<ForgotPasswordPage />} />
          <Route path="/reset_password/:token" element={<ResetPasswordPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
