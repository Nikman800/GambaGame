import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import BracketTree from './BracketTree';
import BettingPhase from './BettingPhase';
import MatchResult from './MatchResult';
import io from 'socket.io-client';

interface BracketStartedData {
  bracketId: string;
  match: { player1: string; player2: string };
}

const BracketPrep: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<string[]>([]);
  const [spectators, setSpectators] = useState<Array<{ _id: string, username: string }>>([]);
  const [admin, setAdmin] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentMatch, setCurrentMatch] = useState<{ player1: string, player2: string } | null>(null);
  const [bettingPhase, setBettingPhase] = useState(false);
  const [matchInProgress, setMatchInProgress] = useState(false);
  const navigate = useNavigate();
  const [socket, setSocket] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const newSocket = io('/');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const fetchBracketDetails = async () => {
      try {
        const token = Cookies.get('TOKEN');
        const response = await axios.get(`/api/brackets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setParticipants(response.data.participants);
        setSpectators(response.data.bracket.spectators);
        setAdmin(response.data.bracket.admin);
      } catch (error) {
        console.error('Error fetching bracket details:', error);
      }
    };

    fetchBracketDetails();
  }, [id]);

  useEffect(() => {
    const token = Cookies.get('TOKEN');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(admin === decodedToken.userId);
    }
  }, [id, admin]);

  useEffect(() => {
    if (socket) {
      socket.on('bracketStarted', (data: BracketStartedData) => {
        if (data.bracketId === id) {
          setCurrentMatch(data.match);
          setBettingPhase(true);
        }
      });
    }
  }, [socket, id]);

  const handleStartBracket = async () => {
    try {
      const token = Cookies.get('TOKEN');
      await axios.post(`/api/brackets/${id}/start`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentMatch({
        player1: participants[0],
        player2: participants[1]
      });
      setBettingPhase(true);
      socket.emit('startBracket', { bracketId: id, round: currentRound, match: { player1: participants[0], player2: participants[1] } });
    } catch (error) {
      console.error('Error starting bracket:', error);
    }
  };

  const handleStartMatch = () => {
    setBettingPhase(false);
    setMatchInProgress(true);
    socket.emit('startMatch', { bracketId: id, round: currentRound, match: currentMatch });
  };

  const handleMatchResult = (winner: string) => {
    setMatchInProgress(false);
    // Update bracket state with the winner
    // Move to next match or next round
    socket.emit('matchResult', { bracketId: id, round: currentRound, match: currentMatch, winner });
  };

  return (
    <Container>
      <h1>Bracket Preparation</h1>
      <BracketTree participants={participants} />
      <p>Spectators: {spectators.length}</p>
      {bettingPhase && currentMatch && id && (
        <BettingPhase
          match={currentMatch}
          onStartMatch={handleStartMatch}
          id={id}
          isAdmin={isAdmin}
        />
      )}
      {matchInProgress && currentMatch && (
        <MatchResult
          match={currentMatch}
          onSelectWinner={handleMatchResult}
        />
      )}
      {!bettingPhase && !matchInProgress && isAdmin && (
        <Button variant="primary" onClick={handleStartBracket}>Start Bracket</Button>
      )}
    </Container>
  );
};

export default BracketPrep;