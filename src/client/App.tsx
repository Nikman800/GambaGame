import React from "react";
import { Route, Routes, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import LoginPage from "./LoginPage.js";
import CreateAccountPage from './CreateAccount.js';
import FreeComponent from './FreeComponent.js';
import AuthComponent from './AuthComponent.js';
import ProtectedRoute from './ProtectedRoutes.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './HomePage.js';

function App() {
  return (
    <div className="App">
      <Header />
      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
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

function Header() {
  return (
    <header className="App-header">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">GambaGame</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/login">Log In</Nav.Link>
            <Nav.Link as={Link} to="/free">Free Component</Nav.Link>
            <Nav.Link as={Link} to="/auth">Auth Component</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
}

export default App;