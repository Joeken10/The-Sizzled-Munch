import React from 'react'
import "./MenuItems.css"
import menuAlbum from '../images/Burger Taste.jpeg';

function MenuItems() {
  return (
    <div>
      <div className="card" style={{width: '18rem'}}>
        <img src={menuAlbum} className="card-img-top" alt="food1"/>
          <div className="card-body">
            <h5 className="card-title">Card title</h5>
            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
            <a href="ingridients" className="btn btn-primary">Ingridients</a>
          </div>
      </div>
      <div className="card" style={{width: '18rem'}}>
        <img src={menuAlbum} className="card-img-top" alt="food1"/>
          <div className="card-body">
            <h5 className="card-title">Card title</h5>
            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
            <a href="ingridients" className="btn btn-primary">Ingridients</a>
          </div>
      </div>
    </div>
  )
}

export default MenuItems
