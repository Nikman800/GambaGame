import React, { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

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

  if (!bracket) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <h1>{bracket.name}</h1>
      <p>Description: {bracket.description}</p>
      <p>Type: {bracket.type}</p>
      <p>Participants: {bracket.participants.join(', ')}</p>
      <p>Runs: {bracket.runs}</p>
    </Container>
  );
};

export default BracketPage;