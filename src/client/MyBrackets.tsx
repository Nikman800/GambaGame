import React, { useEffect, useState } from 'react';
import { Container, ListGroup, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie

interface Bracket {
  _id: string;
  name: string;
  description: string;
  type: string;
  participants: string[];
  runs: number;
}

const MyBrackets: React.FC = () => {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrackets = async () => {
      try {
        // Get the token from cookies
        const token = Cookies.get('TOKEN');
        if (!token) {
          console.error('No token found');
          return;
        }

        console.log('Token:', token); // Debugging: Log the token

        const response = await axios.get('http://localhost:3000/brackets', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          },
        });

        if (Array.isArray(response.data)) {
          setBrackets(response.data);
        } else {
          console.error('API response is not an array:', response.data);
        }
      } catch (error) {
        console.error('Error fetching brackets:', error);
      }
    };

    fetchBrackets();
  }, []);

  const handleBracketClick = (id: string) => {
    navigate(`/bracket/${id}`);
  };

  return (
    <Container>
      <h1>My Brackets</h1>
      {brackets.length === 0 ? (
        <p>You have not created any brackets!!</p>
      ) : (
        <ListGroup>
          {brackets.map((bracket) => (
            <ListGroup.Item key={bracket._id} onClick={() => handleBracketClick(bracket._id)}>
              {bracket.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default MyBrackets;