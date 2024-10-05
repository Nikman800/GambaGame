import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';

interface BettingPhaseProps {
  match: { player1: string, player2: string };
  onStartMatch: () => void;
  id: string;
  isAdmin: boolean;
}

const BettingPhase: React.FC<BettingPhaseProps> = ({ match, onStartMatch, id, isAdmin }) => {
  const [bet, setBet] = useState({ player: '', amount: 0 });
  const [totalBets, setTotalBets] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchTotalBets = async () => {
      try {
        const token = Cookies.get('TOKEN');
        const response = await axios.get(`/api/brackets/${id}/bets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTotalBets(response.data.totalBets || {});
      } catch (error) {
        console.error('Error fetching total bets:', error);
      }
    };

    fetchTotalBets();
    const interval = setInterval(fetchTotalBets, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [id]);

  const handleBet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('TOKEN');
      await axios.post(`/api/brackets/${id}/bet`, bet, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update local state or refetch total bets
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  return (
    <div>
      <h2>Betting Phase</h2>
      <p>{match.player1} vs {match.player2}</p>
      <p>Total bets: {match.player1}: {totalBets[match.player1] || 0}, {match.player2}: {totalBets[match.player2] || 0}</p>
      {!isAdmin && (
        <Form onSubmit={handleBet}>
          <Form.Group>
            <Form.Label>Select player</Form.Label>
            <Form.Control as="select" onChange={(e) => setBet({ ...bet, player: e.target.value })}>
              <option value={match.player1}>{match.player1}</option>
              <option value={match.player2}>{match.player2}</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Bet amount</Form.Label>
            <Form.Control type="number" onChange={(e) => setBet({ ...bet, amount: parseInt(e.target.value) })} />
          </Form.Group>
          <Button type="submit">Place Bet</Button>
        </Form>
      )}
      {isAdmin && (
        <Button onClick={onStartMatch}>Start Match</Button>
      )}
    </div>
  );
};

export default BettingPhase;