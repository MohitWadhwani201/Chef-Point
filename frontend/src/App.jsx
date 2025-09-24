import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import RecipeGenerator from './components/RecipeGenerator.jsx';
import MyRecipes from './components/MyRecipes.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} logout={logout} />}
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login login={login} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register login={login} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={user ? <RecipeGenerator /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-recipes" 
            element={user ? <MyRecipes /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default React.memo(App);