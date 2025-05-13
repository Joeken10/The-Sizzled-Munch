import React from 'react';
import './MenuItem.css';

function MenuItem({ menuAlbum }) {
  return (
    <div className="menuItem-container">
      <div className="card-grid">
        {menuAlbum.map((item) => (
          <div className="card" key={item.id}>
            <img
              src={item.image}
              className="card-img-top"
              alt={item.itemName || "Menu item image"}
            />
            <div className="card-body">
              <h5 className="card-title">{item.itemName}</h5>
              <h6 className="card-price">ksh.{item.price}/=</h6>
              <p className="card-text">{item.extras}</p>
              <a href="ingridients" className="btn btn-primary">
                {item.description}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItem;
