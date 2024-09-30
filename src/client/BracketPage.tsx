import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import BracketTree from './BracketTree';

interface Bracket {
  _id: string;
  name: string;
  description: string;
  type: string;
  participants: string[];
  runs: number;
  startingPoints: number;
}

const BracketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        const token = Cookies.get('TOKEN');
        const response = await axios.get(`http://localhost:3000/brackets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBracket(response.data);
      } catch (error) {
        console.error('Error fetching bracket:', error);
      }
    };

    fetchBracket();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit-bracket/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bracket?')) {
      try {
        const token = Cookies.get('TOKEN');
        await axios.delete(`http://localhost:3000/brackets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        navigate('/my-brackets');
      } catch (error) {
        console.error('Error deleting bracket:', error);
      }
    }
  };

  if (!bracket) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <h1>{bracket.name}</h1>
      <p>Description: {bracket.description}</p>
      <p>Type: {bracket.type}</p>
      <p>Runs: {bracket.runs}</p>
      <p>Starting Points for Spectators: {bracket.startingPoints}</p>
      <Button variant="primary" onClick={handleEdit}>Edit Bracket</Button>
      <Button variant="danger" onClick={handleDelete}>Delete Bracket</Button>
      <BracketTree participants={bracket.participants} />
    </Container>
  );
};

export default BracketPage;