import React from 'react';
import './MenuItem.css';

function MenuItem({ menuAlbum, onAddToCart }) {
  return (
    <div className="menuItem-container">
      <div className="card-grid">
        {menuAlbum.map((item) => (
          <article className="card" key={item.id} aria-label={item.item_name}>
            <img
              src={item.image}
              className="card-img-top"
              alt={item.item_name || 'Menu item image'}
              loading="lazy"
            />
            <div className="card-body">
              <h5 className="card-title">{item.item_name}</h5>
              <p className="card-price">ksh. {item.price.toFixed(2)}</p>
              <p className="card-text">{item.extras}</p>

              <a href="#ingredients" className="btn btn-primary" aria-label={`View ingredients of ${item.item_name}`}>
                {item.description}
              </a>

              <button
                className="btn btn-success mt-2 d-flex align-items-center gap-2"
                onClick={() => onAddToCart(item)}
                aria-label={`Add ${item.item_name} to cart`}
                type="button"
              >
                <img
                  src="/icons/add-to-bag-svgrepo-com.svg"
                  alt="Add to Cart Icon"
                  style={{ width: '20px', height: '20px' }}
                  aria-hidden="true"
                />
                Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default MenuItem;
