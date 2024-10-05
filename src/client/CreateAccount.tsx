import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import "./App.css";

function CreateAccountPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (username && password && confirmPassword && password === confirmPassword) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [username, password, confirmPassword]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post('/api/register', {
        username,
        password,
      });

      if (response.status === 201) {
        setMessage("You are Registered Successfully");
        navigate("/login");
        console.log("User created successfully");
      } else {
        setMessage("You Are Not Registered");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating account:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          setMessage(`Registration failed: ${error.response.data.message || "Unknown error"}`);
        } else if (error.request) {
          console.error("Request data:", error.request);
          setMessage("Registration failed: No response from server");
        } else {
          console.error("Error message:", error.message);
          setMessage(`Registration failed: ${error.message}`);
        }
      } else {
        console.error("Unexpected error:", error);
        setMessage("Registration failed: An unexpected error occurred");
      }
    }
  };

  return (
    <Container className="create-account-page">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center">Create Account</h2>
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
            <Form.Group controlId="confirmPassword" className="mt-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3" disabled={isButtonDisabled}>
              Create Account
            </Button>
          </Form>
          {message && <p className="mt-3">{message}</p>}
        </Col>
      </Row>
    </Container>
  );
}

export default CreateAccountPage;