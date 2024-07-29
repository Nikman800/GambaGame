import React, { useState } from "react";
import { Link } from "react-router-dom"; // Assuming you're using react-router for navigation
import "./App.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Authentication logic goes here
    console.log(username, password);
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ marginLeft: '4px' }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Log In</button>
        <div className="create-account">
          <p>Don't have an account? <Link to="/create-account">Create one</Link>.</p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;