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
  spectators: string[];
  isOpen: boolean;
}

const BracketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [admin, setAdmin] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        const token = Cookies.get('TOKEN');
        if (!token) {
          console.error('No token found');
          return;
        }
        const response = await axios.get(`http://localhost:3000/brackets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBracket(response.data.bracket);
        setAdmin(response.data.bracket.admin);
        
        // Decode the token to get the user ID
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          console.log('Decoded user ID:', decodedToken.userId);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
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

  const handleOpenBracket = async () => {
    try {
      const token = Cookies.get('TOKEN');
      await axios.put(`http://localhost:3000/brackets/${id}/open`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/bracket-prep/${id}`);
    } catch (error) {
      console.error('Error opening bracket:', error);
    }
  };

  const handleGoToBracketPrep = () => {
    navigate(`/bracket-prep/${id}`);
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
      {bracket.isOpen && (
        <p>Spectators: {bracket.spectators ? bracket.spectators.length : 0}</p>
      )}
      <p>Status: {bracket.isOpen ? 'Active' : 'Closed'}</p>
      {(() => {
        const token = Cookies.get('TOKEN');
        let userId = null;
        if (token) {
          try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            userId = decodedToken.userId;
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
        
        console.log('Admin:', admin);
        console.log('Decoded USER_ID:', userId);
        console.log('Comparison:', admin && userId && admin.toString() === userId);
        
        return admin && userId && admin.toString() === userId && (
          <>
            <Button variant="primary" onClick={handleEdit}>Edit Bracket</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Bracket</Button>
            {bracket.isOpen ? (
              <Button variant="success" onClick={handleGoToBracketPrep}>Go to Bracket Prep</Button>
            ) : (
              <Button variant="success" onClick={handleOpenBracket}>Open Bracket</Button>
            )}
          </>
        );
      })()}
      <BracketTree participants={bracket.participants} />
    </Container>
  );
};

export default BracketPage;