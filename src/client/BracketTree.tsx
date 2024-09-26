import React from 'react';
import { Container } from 'react-bootstrap';
import './BracketTree.css';

interface BracketTreeProps {
  participants: string[];
}

const BracketTree: React.FC<BracketTreeProps> = ({ participants }) => {
  const rounds = Math.ceil(Math.log2(participants.length));
  const totalParticipants = Math.pow(2, rounds);

  const renderMatch = (roundNumber: number, matchIndex: number) => {
    const participantsInRound = Math.pow(2, rounds - roundNumber + 1);
    const startIndex = matchIndex * 2;
    const participant1 = roundNumber === 1 && startIndex < participants.length ? participants[startIndex] : 'TBD';
    const participant2 = roundNumber === 1 && startIndex + 1 < participants.length ? participants[startIndex + 1] : 'TBD';
    
    return (
      <div key={`match-${roundNumber}-${matchIndex}`} className="match">
        <div className="match-wrapper">
          <div className="participant">{participant1}</div>
          <div className="participant">{participant2}</div>
        </div>
      </div>
    );
  };

  const renderRound = (roundNumber: number) => {
    const matchesInRound = Math.pow(2, rounds - roundNumber);
    return (
      <div key={`round-${roundNumber}`} className={`round round-${roundNumber}`}>
        <h3 className="round-title">{roundNumber === rounds ? 'Finals' : `Round ${roundNumber}`}</h3>
        {Array.from({ length: matchesInRound }, (_, i) => renderMatch(roundNumber, i))}
      </div>
    );
  };

  return (
    <Container className="bracket-tree">
      {Array.from({ length: rounds }, (_, i) => renderRound(i + 1))}
    </Container>
  );
};

export default BracketTree;
