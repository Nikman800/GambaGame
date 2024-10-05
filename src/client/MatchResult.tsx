import React from 'react';
import { Button } from 'react-bootstrap';

interface MatchResultProps {
  match: { player1: string, player2: string };
  onSelectWinner: (winner: string) => void;
}

const MatchResult: React.FC<MatchResultProps> = ({ match, onSelectWinner }) => {
  return (
    <div>
      <h2>Match Result</h2>
      <p>{match.player1} vs {match.player2}</p>
      <Button onClick={() => onSelectWinner(match.player1)}>
        {match.player1} Wins
      </Button>
      <Button onClick={() => onSelectWinner(match.player2)}>
        {match.player2} Wins
      </Button>
    </div>
  );
};

export default MatchResult;
