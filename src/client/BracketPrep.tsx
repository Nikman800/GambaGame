import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const BracketPrep: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<string[]>([]);
  const [spectators, setSpectators] = useState<Array<{ _id: string, username: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBracketDetails = async () => {
      try {
        const token = Cookies.get('TOKEN');
        const response = await axios.get(`http://localhost:3000/brackets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Bracket data:', response.data);
        setParticipants(response.data.participants);
        setSpectators(response.data.bracket.spectators.map((spectator: any) => ({
          _id: spectator._id,
          username: spectator.username
        })));
        console.log('Spectators after setting state:', response.data.bracket.spectators);
      } catch (error) {
        console.error('Error fetching bracket details:', error);
      }
    };

    fetchBracketDetails();
  }, [id]);

  const handleStartBracket = async () => {
    try {
      const token = Cookies.get('TOKEN');
      await axios.post(`http://localhost:3000/brackets/${id}/start`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/bracket/${id}`);
    } catch (error) {
      console.error('Error starting bracket:', error);
    }
  };

  const handleCloseBracket = async () => {
    try {
      const token = Cookies.get('TOKEN');
      await axios.put(`http://localhost:3000/brackets/${id}/close`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/bracket/${id}`);
    } catch (error) {
      console.error('Error closing bracket:', error);
    }
  };

  return (
    <Container>
      <h1>Bracket Preparation</h1>
      <p>Participants in Lobby: {participants.length}</p>
      <ul>
        {participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>
      <p>Spectators: {spectators.length}</p>
      <ul>
        {spectators.map((spectator, index) => (
          <li key={index}>{spectator.username}</li>
        ))}
      </ul>
      <Button variant="primary" onClick={handleStartBracket}>Start Bracket</Button>
      <Button variant="secondary" onClick={handleCloseBracket} className="ml-2">Close Bracket</Button>
    </Container>
  );
};

export default BracketPrep;