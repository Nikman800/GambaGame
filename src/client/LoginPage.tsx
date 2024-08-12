import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";
import "./App.css";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie

interface LoginPageProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted with username:", username, "and password:", password);
  
    axios.post("/login", { username, password })
      .then((result) => {
        console.log("Login successful:", result.data);
  
        // set the cookie
        Cookies.set("TOKEN", result.data.token, {
          path: "/",
        });
  
        // Store the username
        Cookies.set("USERNAME", username, {
          path: "/",
        });
  
        // set isLoggedIn to true
        setIsLoggedIn(true);
  
        // redirect user to the auth page
        navigate("/auth");
      })
      .catch((error) => {
        console.error("There was an error logging in!", error);
      });
  };

  return (
    <Container>
      <h2>Login</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    </Container>
  );
};

export default LoginPage;