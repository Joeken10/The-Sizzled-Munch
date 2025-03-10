import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home from "./Components/Home";
import Checkout from "./Components/Checkout";
import Receipt from "./Components/Receipt";
import Profile from "./Components/Profile";

const Navbar = () => (
    <nav className="navbar">
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/checkout" className="nav-link">Checkout</NavLink>
        <NavLink to="/receipt" className="nav-link">Receipt</NavLink>
        <NavLink to="/profile" className="nav-link">Profile</NavLink>
    </nav>
);

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/receipt" element={<Receipt />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
