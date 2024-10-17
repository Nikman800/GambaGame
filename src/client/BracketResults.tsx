import React, { useEffect, useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import BracketTree from './BracketTree';

interface BracketResult {
  bracketWinner: string;
  spectatorResults: Array<{ username: string; points: number }>;
  finalBracket: {
    participants: string[];
    matchResults: Array<{
      round: number;
      match: number;
      winner: string;
      _id: string;
    }>;
  };
  hasSpectators: boolean;
}

const BracketResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<BracketResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = Cookies.get('TOKEN');
        console.log('Fetching results for bracket:', id);
        const response = await axios.get(`/api/brackets/${id}/final-results`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Received response:', response.data);
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching bracket results:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
        }
        setError('Failed to fetch bracket results. Please try again later.');
      }
    };

    fetchResults();
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!results) {
    return <div>Loading results... (Bracket ID: {id})</div>;
  }

  const handleBackToBracket = () => {
    navigate(`/bracket/${id}`);
  };

  return (
    <Container>
      <h1>Bracket Results</h1>
      <h2>Bracket Winner: {results.bracketWinner || 'Not determined'}</h2>
      
      {results.hasSpectators ? (
        <>
          <h2>Spectator Winner: {results.spectatorResults[0].username} ({results.spectatorResults[0].points} points)</h2>
          <h3>Final Spectator Standings</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {results.spectatorResults.map((spectator, index) => (
                <tr key={spectator.username}>
                  <td>{index + 1}</td>
                  <td>{spectator.username}</td>
                  <td>{spectator.points}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <h3>There were no spectators for this bracket.</h3>
      )}

      <BracketTree 
        participants={results.finalBracket.participants}
        currentRound={Math.ceil(Math.log2(results.finalBracket.participants.length))}
        matchResults={results.finalBracket.matchResults.reduce((acc, match) => {
          acc[`${match.round - 1}-${match.match - 1}`] = match.winner;
          return acc;
        }, {} as { [key: string]: string })}
      />

      <Button variant="primary" onClick={handleBackToBracket} className="mt-3">Back to Bracket Page</Button>
    </Container>
  );
};

export default BracketResults;
