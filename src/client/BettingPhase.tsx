import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';

interface BettingPhaseProps {
  match: { player1: string, player2: string };
  onStartMatch: () => void;
  id: string;
  isAdmin: boolean;
  bets: any[];
}

const BettingPhase: React.FC<BettingPhaseProps> = ({ match, onStartMatch, id, isAdmin, bets }) => {
  const [bet, setBet] = useState({ player: '', amount: 0 });
  const [totalBets, setTotalBets] = useState<Record<string, number>>({});
  const [odds, setOdds] = useState<Record<string, number>>({});
  const [potentialWinnings, setPotentialWinnings] = useState(0);

  useEffect(() => {
    const fetchBetsAndOdds = async () => {
      try {
        const token = Cookies.get('TOKEN');
        const response = await axios.get(`/api/brackets/${id}/bets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTotalBets(response.data.totalBets);
        setOdds(response.data.odds);
      } catch (error) {
        console.error('Error fetching bets and odds:', error);
      }
    };

    fetchBetsAndOdds();
    const interval = setInterval(fetchBetsAndOdds, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (bet.player && bet.amount > 0) {
      const potentialWin = bet.amount * odds[bet.player];
      setPotentialWinnings(potentialWin);
    } else {
      setPotentialWinnings(0);
    }
  }, [bet, odds]);

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
      <p>Odds: {match.player1}: {odds[match.player1]?.toFixed(2) || 'N/A'}, {match.player2}: {odds[match.player2]?.toFixed(2) || 'N/A'}</p>
      {!isAdmin && (
        <Form onSubmit={handleBet}>
          <Form.Group>
            <Form.Label>Select player</Form.Label>
            <Form.Control as="select" onChange={(e) => setBet({ ...bet, player: e.target.value })}>
              <option value="">Select a player</option>
              <option value={match.player1}>{match.player1}</option>
              <option value={match.player2}>{match.player2}</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Bet amount</Form.Label>
            <Form.Control type="number" onChange={(e) => setBet({ ...bet, amount: parseInt(e.target.value) })} />
          </Form.Group>
          <p>Potential winnings: {potentialWinnings.toFixed(2)}</p>
          <Button type="submit">Place Bet</Button>
        </Form>
      )}
      {isAdmin && (
        <Button onClick={onStartMatch}>Start Match</Button>
      )}
      <h3>Current Bets</h3>
      <ul>
        {bets.map((bet, index) => (
          <li key={index}>{bet.gambler.username}: {bet.amount} on {bet.player}</li>
        ))}
      </ul>
    </div>
  );
}

export default BettingPhase;