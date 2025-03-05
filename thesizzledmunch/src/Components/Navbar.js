import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand" href="navbar">The Sizzled Munch</a>

          {/* Centered Search Bar */}
          <div className="search-container">
            <form className="d-flex" role="search">
              <input className="form-control" type="search" placeholder="Search" aria-label="Search" />
            </form>
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="home">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="home">More</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="home">add to Cart</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="home">User</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
