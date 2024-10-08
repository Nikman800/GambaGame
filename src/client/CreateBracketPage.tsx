import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function CreateBracketPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [participants, setParticipants] = useState('');
  const [startingPoints, setStartingPoints] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const token = Cookies.get('TOKEN');
      const response = await axios.post('/api/create-bracket', 
        { name, description, type, participants, startingPoints: parseInt(startingPoints) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);
      
      // Clear all states
      setName('');
      setDescription('');
      setType('');
      setParticipants('');
      setStartingPoints('');
      
      // Navigate to the newly created bracket page
      navigate(`/bracket/${response.data.bracketId}`, { 
        state: { 
          canEdit: response.data.canEdit,
          canDelete: response.data.canDelete,
          canOpen: response.data.canOpen
        } 
      });
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
        <Form.Group controlId="startingPoints">
          <Form.Label>Starting Points</Form.Label>
          <Form.Control 
            type="number" 
            placeholder="Enter starting points for spectators" 
            required 
            value={startingPoints}
            onChange={(e) => setStartingPoints(e.target.value)}
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