import React, { useState, createContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import HomePages from './pages/HomePages';
import MenuList from './pages/MenuList';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MenuManagement from './pages/MenuManagement';
import AdminOrders from './pages/AdminOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers'; 
import UserProfile from './pages/UserProfile';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyOrders from './pages/MyOrders';
import EmailVerificationPage from './pages/EmailVerificationPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const AuthContext = createContext();

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (parsedUser && parsedUser.id) {
        return parsedUser;
      } else {
        localStorage.removeItem('user');
        return null;
      }
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  
  const RequireAuth = ({ children }) => {
    return user && user.id ? children : <Navigate to="/signin" />;
  };

  
  const RequireAdmin = ({ children }) => {
    return user && user.isAdmin ? children : <Navigate to="/signin" />;
  };

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
          <Route path="/forgot_password" element={<ForgotPasswordPage />} />
          <Route path="/reset_password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify_email" element={<EmailVerificationPage />} />

          
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <UserProfile userId={user?.id} />
              </RequireAuth>
            }
          />
          <Route
            path="/my-orders"
            element={
              <RequireAuth>
                <MyOrders />
              </RequireAuth>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/menu"
            element={
              <RequireAdmin>
                <MenuManagement />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RequireAdmin>
                <AdminOrders />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                <AdminUsers />
              </RequireAdmin>
            }
          />
        </Routes>

        <Footer />
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;