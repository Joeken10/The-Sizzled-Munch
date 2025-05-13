import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MenuList from './components/MenuList'
import {BrowserRuter as Router, Routes, BrowserRouter, Route} from "react-router-dom";

function App() {
  return (
    <div>
      <BrowserRouter>
      <Router>
        <Routes>
          <Route path="" element="" />
        </Routes>
        </Router>
      </BrowserRouter>
      <Navbar />
      <MenuList />
      <Footer />
    </div>
    
  )
}
export default App
