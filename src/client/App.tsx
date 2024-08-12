import React, { useState, useEffect } from "react";
import { Route, Routes, Link } from "react-router-dom";
import { Container, Navbar, Nav, Button, Offcanvas } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import Cookies from 'js-cookie';
import LoginPage from "./LoginPage.js";
import CreateAccountPage from './CreateAccount.js';
import FreeComponent from './FreeComponent.js';
import AuthComponent from './AuthComponent.js';
import ProtectedRoute from './ProtectedRoutes.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './HomePage.js';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = Cookies.get("TOKEN");
    const storedUsername = Cookies.get("USERNAME");
    setIsLoggedIn(!!token);
    setUsername(storedUsername || "");
  }, []);

  const handleLogout = () => {
    Cookies.remove("TOKEN", { path: "/" });
    Cookies.remove("USERNAME", { path: "/" });
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} username={username} />
      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/register" element={<CreateAccountPage />} />
          <Route path="/free" element={<FreeComponent />} />
          <Route 
            path="/auth" 
            element={
              <ProtectedRoute>
                <AuthComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Container>
    </div>
  );
}

interface HeaderProps {
  isLoggedIn: boolean;
  handleLogout: () => void;
  username: string;
}

function Header({ isLoggedIn, handleLogout, username }: HeaderProps) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <header className="App-header">
      <Navbar bg="dark" variant="dark" expand="lg" className="w-100">
        <Container>
          <Navbar.Brand href="/">GambaGame</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/free">Free Component</Nav.Link>
            <Nav.Link as={Link} to="/auth">Auth Component</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <Button onClick={() => setShowSidebar(true)}>{username}</Button>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Log In</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Button variant="primary" className="w-100 mb-2">Your Profile</Button>
          <Button variant="primary" className="w-100 mb-2">Your Brackets</Button>
          <Button variant="primary" className="w-100 mb-2">Create Bracket</Button>
          <Button variant="primary" className="w-100 mb-2">Join Bracket</Button>
          <Button variant="danger" className="w-100" onClick={handleLogout}>Sign Out</Button>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}

export default App;