import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, logout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Recipe Generator</div>
      <ul className="navbar-nav">
        <li><Link to="/">Generate Recipe</Link></li>
        <li><Link to="/my-recipes">My Recipes</Link></li>
        <li>
          <span>Welcome, {user.username}</span>
          <button onClick={logout} style={{ marginLeft: '1rem' }} className="btn btn-secondary">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;