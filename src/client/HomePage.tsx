import React from "react";
import { Container, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";

function HomePage() {
  let location = useLocation();

  return (
    <Container className="text-center mt-4">
      <h1 style={{ fontFamily: "Silkscreen, cursive" }}>GambaGame</h1>
      {location.pathname === "/" && (
        <div className="buttons mt-3">
          <Button variant="primary" className="me-2">Join Bracket</Button>
          <Button variant="secondary">Create Bracket</Button>
        </div>
      )}
    </Container>
  );
}

export default HomePage;