import React, { useEffect, useState } from 'react';
import { Container, ListGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const JoinBracket: React.FC = () => {
  const [openBrackets, setOpenBrackets] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpenBrackets = async () => {
      try {
        const token = Cookies.get('TOKEN');
        const response = await axios.get('http://localhost:3000/open-brackets', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOpenBrackets(response.data);
      } catch (error) {
        console.error('Error fetching open brackets:', error);
      }
    };

    fetchOpenBrackets();
  }, []);

  const handleJoinBracket = async (id: string) => {
    try {
      const token = Cookies.get('TOKEN');
      await axios.post(`http://localhost:3000/brackets/${id}/join`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/bracket-prep/${id}`);
    } catch (error) {
      console.error('Error joining bracket:', error);
    }
  };

  return (
    <Container>
      <h1>Join Bracket</h1>
      <ListGroup>
        {openBrackets.map((bracket) => (
          <ListGroup.Item key={bracket._id}>
            {bracket.name}
            <Button variant="primary" onClick={() => handleJoinBracket(bracket._id)}>Join</Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default JoinBracket;