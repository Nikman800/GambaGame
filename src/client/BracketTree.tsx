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

  const generateBracket = (participants: string[]): string[][] => {
    const bracket: string[][] = [];
    let currentRound = [...participants];
    
    while (currentRound.length > 1) {
      bracket.push(currentRound);
      const nextRound: string[] = [];
      for (let i = 0; i < currentRound.length; i += 2) {
        if (i + 1 < currentRound.length) {
          nextRound.push('TBD');
        } else {
          nextRound.push(currentRound[i]);
        }
      }
      currentRound = nextRound;
    }
    bracket.push(currentRound); // Final round

    return bracket;
  };

  const bracket = generateBracket(participants);

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
            if (roundIndex < currentRound && matchResults[`${roundIndex}-${i}`]) {
              const winner = matchResults[`${roundIndex}-${i}`];
              return renderMatch(winner, undefined, roundIndex, i);
            }
            return renderMatch(player1, player2, roundIndex, i);
          })}
        </div>
      </div>
    );
  };

  return (
    <Container className="bracket-tree">
      {bracket.map((roundParticipants, index) => renderRound(roundParticipants, index))}
      {bracket[bracket.length - 1][0] !== 'TBD' && (
        <div className="winner-tag">Winner: {bracket[bracket.length - 1][0]}</div>
      )}
    </Container>
  );
};

export default BracketTree;
