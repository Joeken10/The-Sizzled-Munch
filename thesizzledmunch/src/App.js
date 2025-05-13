import React from 'react'
// import Navbar from './components/Navbar'
import Footer from './components/Footer'

import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePages from './pages/HomePages';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePages/>} />
        </Routes>
      </BrowserRouter>
      
      <Footer />
    </div>
    
  )
}
export default App
