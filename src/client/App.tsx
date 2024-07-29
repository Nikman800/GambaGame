import React from "react";
import "./App.css";
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import LoginPage from "./LoginPage"; // Adjust the import path as necessary
import CreateAccountPage from './CreateAccount';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/register" element={<CreateAccountPage />} />
          {/* Define other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

function Header() {
  let location = useLocation();

  return (
    <header className="App-header">
      <div className="top-right">
        <Link to="/login" className="login-button">Log In</Link>
      </div>
      <h1 style={{ fontFamily: "Silkscreen, cursive" }}>GambaGame</h1>
      {/* Conditionally render buttons only on the home page */}
      {location.pathname === "/" && (
        <div className="buttons">
          <button className="bracket-button">Join Bracket</button>
          <button className="bracket-button">Create Bracket</button>
        </div>
      )}
    </header>
  );
}

export default App;