import React from 'react'
import "./MenuItem.css"

function MenuItem({menuAlbum}) {
  return (
    <div className='menuItem-container'>
      <div className="card" style={{width: '18rem'}}>
        {menuAlbum.map ((item)=>(
          <li key={item.id}>
          <img src={item.image} className="card-img-top" alt="Classic American Burger with Fried Egg"/>
          <div className="card-body">
            <h5 className="card-title">{item.itemName}</h5>
            <h6 className="card-title">{item.price}</h6>
            <p className="card-text">{item.extras}</p>
            <a href="ingridients" className="btn btn-primary">{item.description}</a>
          </div>
          </li>
        ))}
        
      </div>
    </div>
  )
}

export default MenuItem
