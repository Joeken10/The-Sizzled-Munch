import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Components/Home";
import Checkout from "./Components/Checkout";
import Receipt from "./Components/Receipt";
import Profile from "./Components/Profile";

function App() {
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/checkout">Checkout</Link>
                <Link to="/receipt">Receipt</Link>
                <Link to="/profile">Profile</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/receipt" element={<Receipt />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;




