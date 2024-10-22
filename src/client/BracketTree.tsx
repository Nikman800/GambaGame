import React from 'react';
import { Container } from 'react-bootstrap';
import './BracketTree.css';

interface BracketTreeProps {
  participants: string[];
  currentRound: number;
  matchResults: { [key: string]: string };
}

const BracketTree: React.FC<BracketTreeProps> = ({ participants, currentRound, matchResults }) => {
  const rounds = Math.ceil(Math.log2(participants.length));

  const generateBracket = (): string[][] => {
    const bracket: string[][] = [participants];
    
    for (let round = 1; round < rounds; round++) {
      const previousRound = bracket[round - 1];
      const currentRound: string[] = [];
      
      for (let i = 0; i < previousRound.length; i += 2) {
        const matchId = `${round - 1}-${Math.floor(i / 2)}`;
        const winner = matchResults[matchId];
        
        if (winner) {
          currentRound.push(winner);
        } else {
          currentRound.push('TBD');
        }
      }
      
      bracket.push(currentRound);
    }

    return bracket;
  };

  const bracket = generateBracket();

  const renderMatch = (player1: string, player2: string | undefined, roundIndex: number, matchIndex: number) => {
    const matchId = `${roundIndex}-${matchIndex}`;
    const winner = matchResults[matchId];

    return (
      <div key={`match-${matchId}`} className="match">
        <div className="match-wrapper">
          <div className={`participant ${winner === player1 ? 'winner' : ''}`}>{player1}</div>
          {player2 && <div className={`participant ${winner === player2 ? 'winner' : ''}`}>{player2}</div>}
        </div>
      </div>
    );
  };

  const renderRound = (roundParticipants: string[], roundIndex: number) => {
    return (
      <div key={`round-${roundIndex}`} className={`round round-${roundIndex + 1}`}>
        <div className="matches-container">
          {Array.from({ length: Math.ceil(roundParticipants.length / 2) }, (_, i) => {
            const player1 = roundParticipants[i * 2];
            const player2 = roundParticipants[i * 2 + 1];
            return renderMatch(player1, player2, roundIndex, i);
          })}
        </div>
      </div>
    );
  };

  return (
    <Container className="bracket-tree">
      {bracket.map((roundParticipants, index) => renderRound(roundParticipants, index))}
    </Container>
  );
};

export default BracketTree;