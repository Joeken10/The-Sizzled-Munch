import React, { useEffect, useState } from 'react'
import "./MenuList.css"
import MenuItem from './MenuItem';

function MenuList() {
  const[albums, setAlbums] = useState([]);

  useEffect(()=>{
    fetchAlbumData();
  })

  const fetchAlbumData =() =>{
    fetch("http://localhost:5000/menuList")
    .then(response =>response.json())
    .then(data=> setAlbums(data));
  };


  return (
    <div className='menuList-container'>
      <MenuItem menuAlbum={albums}/>
    </div>
  )
}

export default MenuList
