import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';

function CreateBracketPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [participants, setParticipants] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const token = Cookies.get('TOKEN');
      const response = await axios.post('http://localhost:3000/create-bracket', 
        { name, description, type, participants },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);
      // Handle successful creation (e.g., show a success message, redirect to bracket page)
    } catch (error) {
      console.error('Error creating bracket:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <Container>
      <h1>Create Bracket</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="bracketName">
          <Form.Label>Bracket Name</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter bracket name" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="bracketDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Enter description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="bracketType">
          <Form.Label>Type of Bracket</Form.Label>
          <Form.Select 
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select bracket type</option>
            <option value="single">Single Elimination</option>
            <option value="double">Double Elimination</option>
            <option value="triple">Triple Elimination</option>
            <option value="roundRobin">Round Robin</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="participants">
          <Form.Label>Participants</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={5} 
            placeholder="Enter participants, one per line" 
            required 
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Create
        </Button>
      </Form>
    </Container>
  );
}

export default CreateBracketPage;