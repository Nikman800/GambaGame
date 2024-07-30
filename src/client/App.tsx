import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import LoginPage from "./LoginPage.js"; // Adjust the import path as necessary
import CreateAccountPage from './CreateAccount.js';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Container>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/register" element={<CreateAccountPage />} />
            {/* Define other routes here */}
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

function Header() {
  let location = useLocation();

  return (
    <header className="App-header">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">GambaGame</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/login">Log In</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container className="text-center mt-4">
        <h1 style={{ fontFamily: "Silkscreen, cursive" }}>GambaGame</h1>
        {/* Conditionally render buttons only on the home page */}
        {location.pathname === "/" && (
          <div className="buttons mt-3">
            <Button variant="primary" className="me-2">Join Bracket</Button>
            <Button variant="secondary">Create Bracket</Button>
          </div>
        )}
      </Container>
    </header>
  );
}

export default App;