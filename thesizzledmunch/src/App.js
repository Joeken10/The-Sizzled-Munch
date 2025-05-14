import React from 'react'

import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePages from './pages/HomePages';
import MenuList from './pages/MenuList';



function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePages/>} />
          <Route path="/menu" element={<MenuList />} />
        </Routes>
      </BrowserRouter>
      
    </div>
    
  )
}
export default App
