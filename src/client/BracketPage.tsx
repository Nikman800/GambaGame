import React, { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Bracket {
  _id: string;
  name: string;
  description: string;
  type: string;
  participants: string[];
  runs: number;
}

const BracketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bracket, setBracket] = useState<Bracket | null>(null);

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/brackets/${id}`);
        setBracket(response.data);
      } catch (error) {
        console.error('Error fetching bracket:', error);
      }
    };

    fetchBracket();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (bracket) {
      const { name, value } = e.target;
      if (name === 'participants') {
        setBracket({ ...bracket, participants: value.split('\n') });
      } else {
        setBracket({ ...bracket, [name]: value });
      }
    }
  };

  const handleSave = async () => {
    if (bracket) {
      try {
        await axios.put(`http://localhost:3000/brackets/${id}`, bracket);
        alert('Bracket updated successfully!');
      } catch (error) {
        console.error('Error updating bracket:', error);
      }
    }
  };

  if (!bracket) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <h1>{bracket.name}</h1>
      <Form>
        <Form.Group controlId="bracketName">
          <Form.Label>Bracket Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={bracket.name}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="bracketDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={bracket.description}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="bracketType">
          <Form.Label>Type of Bracket</Form.Label>
          <Form.Control
            type="text"
            name="type"
            value={bracket.type}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="bracketParticipants">
          <Form.Label>Participants</Form.Label>
          <Form.Control
            as="textarea"
            name="participants"
            value={bracket.participants.join('\n')}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="bracketRuns">
          <Form.Label>Runs</Form.Label>
          <Form.Control
            type="number"
            name="runs"
            value={bracket.runs}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSave} className="mt-3">
          Save
        </Button>
      </Form>
    </Container>
  );
};

export default BracketPage;