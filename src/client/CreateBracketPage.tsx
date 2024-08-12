import React from 'react';
import { Container, Form, Button } from 'react-bootstrap';

function CreateBracketPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission logic here
  };

  return (
    <Container>
      <h1>Create Bracket</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="bracketName">
          <Form.Label>Bracket Name</Form.Label>
          <Form.Control type="text" placeholder="Enter bracket name" required />
        </Form.Group>
        <Form.Group controlId="bracketDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Enter description" />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Create
        </Button>
      </Form>
    </Container>
  );
}

export default CreateBracketPage;