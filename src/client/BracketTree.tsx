import React from 'react';
import { Container } from 'react-bootstrap';
import './BracketTree.css';

interface BracketTreeProps {
  participants: string[];
  currentRound: number;
  matchResults: Array<{ round: number; match: number; winner: string }> | { [key: string]: string };
}

const BracketTree: React.FC<BracketTreeProps> = ({ participants, currentRound, matchResults }) => {
  const rounds = Math.ceil(Math.log2(participants.length));

  const generateBracket = (): string[][] => {
    const bracket: string[][] = [participants];
    
    for (let round = 1; round < rounds; round++) {
      const previousRound = bracket[round - 1];
      const currentRound: string[] = [];
      
      for (let i = 0; i < previousRound.length; i += 2) {
        const matchNumber = Math.floor(i / 2);
        let winner;
        if (Array.isArray(matchResults)) {
          const result = matchResults.find(r => r.round === round && r.match === matchNumber);
          winner = result ? result.winner : undefined;
        } else {
          winner = matchResults[`${round}-${matchNumber}`];
        }
        
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
    let winner;
    if (Array.isArray(matchResults)) {
      const result = matchResults.find(r => r.round === roundIndex + 1 && r.match === matchIndex);
      winner = result ? result.winner : undefined;
    } else {
      winner = matchResults[`${roundIndex + 1}-${matchIndex}`];
    }

    return (
      <div key={`match-${roundIndex}-${matchIndex}`} className="match">
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
