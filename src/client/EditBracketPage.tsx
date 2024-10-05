import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';

function EditBracketPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [participants, setParticipants] = useState('');
  const [startingPoints, setStartingPoints] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        const token = Cookies.get('TOKEN');
        const response = await axios.get(`/api/brackets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const bracket = response.data;
        setName(bracket.name || '');
        setDescription(bracket.description || '');
        setType(bracket.type || '');
        setParticipants(Array.isArray(bracket.participants) ? bracket.participants.join('\n') : '');
        setStartingPoints(bracket.startingPoints ? bracket.startingPoints.toString() : '');
      } catch (error) {
        console.error('Error fetching bracket:', error);
      }
    };

    fetchBracket();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const token = Cookies.get('TOKEN');
      const response = await axios.put(`/api/brackets/${id}`, 
        { name, description, type, participants, startingPoints: parseInt(startingPoints) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);
      
      // Navigate back to the bracket page
      navigate(`/bracket/${id}`);
    } catch (error) {
      console.error('Error updating bracket:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <Container>
      <h1>Edit Bracket</h1>
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
          Update
        </Button>
      </Form>
    </Container>
  );
}

export default EditBracketPage;
