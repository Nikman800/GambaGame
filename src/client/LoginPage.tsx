import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import "./App.css";
import axios from "axios";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/login', {
        username,
        password,
      });

      if (response.status >= 200 && response.status < 300) {
        setMessage("You have logged in successfully");
        navigate("/dashboard"); // Navigate to a dashboard or home page after login
        console.log("User logged in successfully");
      } else {
        setMessage("Login failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error logging in:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          setMessage(`Login failed: ${error.response.data.message || "Unknown error"}`);
        } else if (error.request) {
          console.error("Request data:", error.request);
          setMessage("Login failed: No response from server");
        } else {
          console.error("Error message:", error.message);
          setMessage(`Login failed: ${error.message}`);
        }
      } else {
        console.error("Unexpected error:", error);
        setMessage("Login failed: An unexpected error occurred");
      }
    }
  };

  return (
    <Container className="login-page">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center">Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            </Form.Group>
            <Form.Group controlId="password" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Log In
            </Button>
            <div className="create-account mt-3">
              <p>
                Don't have an account? <Link to="/create-account">Create one</Link>.
              </p>
            </div>
          </Form>
          {message && <p className="mt-3">{message}</p>}
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;