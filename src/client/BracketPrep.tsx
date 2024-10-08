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
  bracketName: string;
  currentRound: number;
}

const BracketPrep: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bracketName, setBracketName] = useState('');
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
  const [bracketStarted, setBracketStarted] = useState(false);
  const [bets, setBets] = useState<any[]>([]);
  const [gamblerCount, setGamblerCount] = useState(0);

  useEffect(() => {
    const newSocket = io('/');
    setSocket(newSocket);

    newSocket.on('bracketStarted', (data: BracketStartedData) => {
      console.log('Bracket started:', data);
      setBracketStarted(true);
      setCurrentMatch(data.match);
      setBettingPhase(true);
      setBracketName(data.bracketName);
      setCurrentRound(data.currentRound);
    });

    newSocket.on('matchStarted', () => {
      setBettingPhase(false);
      setMatchInProgress(true);
    });

    newSocket.on('matchEnded', (data: { winner: string, nextMatch: { player1: string, player2: string } | null }) => {
      setMatchInProgress(false);
      if (data.nextMatch) {
        setCurrentMatch(data.nextMatch);
        setBettingPhase(true);
        setCurrentRound(prevRound => prevRound + 1);
      } else {
        setBracketStarted(false);
      }
    });

    newSocket.on('bracketUpdated', (data: { spectators: Array<{ _id: string, username: string }>, gamblerCount: number }) => {
      setSpectators(data.spectators);
      setGamblerCount(data.gamblerCount);
    });

    newSocket.on('bracketEnded', (data: { message: string, bracketId: string }) => {
      setBracketStarted(false);
      setCurrentMatch(null);
      setBets([]);
      setGamblerCount(0);
      setBettingPhase(false);
      setMatchInProgress(false);
      setCurrentRound(1);
      navigate(`/bracket/${data.bracketId}`);
    });

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
        setBracketName(response.data.bracket.name);
        setParticipants(response.data.participants);
        setSpectators(response.data.bracket.spectators);
        setAdmin(response.data.bracket.admin);
        setBracketStarted(response.data.bracket.status === 'started');
        setCurrentMatch(response.data.bracket.currentMatch);
        setBettingPhase(response.data.bracket.status === 'started' && !response.data.bracket.matchInProgress);
        setMatchInProgress(response.data.bracket.matchInProgress);
      } catch (error) {
        console.error('Error fetching bracket details:', error);
      }
    };

    fetchBracketDetails();
  }, [id]);

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        const token = Cookies.get('TOKEN');
        const response = await axios.get(`/api/brackets/${id}/admin-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error('Error fetching admin status:', error);
      }
    };

    fetchAdminStatus();
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('joinBracket', id);
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
      console.log('Bracket start request sent');
    } catch (error) {
      console.error('Error starting bracket:', error);
    }
  };

  const handleEndBracket = async () => {
    try {
      const token = Cookies.get('TOKEN');
      await axios.put(`/api/brackets/${id}/end`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // The state will be updated by the 'bracketEnded' socket event
    } catch (error) {
      console.error('Error ending bracket:', error);
    }
  };

  const handleStartMatch = async () => {
    try {
      const token = Cookies.get('TOKEN');
      await axios.post(`/api/brackets/${id}/start-match`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const handleMatchResult = async (winner: string) => {
    try {
      const token = Cookies.get('TOKEN');
      await axios.post(`/api/brackets/${id}/match-result`, { winner }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error submitting match result:', error);
    }
  };

  return (
    <Container>
      <h1>{bracketName}</h1>
      {isAdmin && !bracketStarted && (
        <Button onClick={handleStartBracket}>Start Bracket</Button>
      )}
      {isAdmin && bracketStarted && (
        <Button onClick={handleEndBracket}>End Bracket</Button>
      )}
      {bracketStarted && currentMatch && (
        <div>
          <h2>Round {currentRound}</h2>
          <p>{currentMatch.player1} vs {currentMatch.player2}</p>
          {bettingPhase ? (
            <div>
              <h3>Betting Phase</h3>
              {isAdmin && (
                <Button onClick={handleStartMatch}>Start Game Phase</Button>
              )}
            </div>
          ) : (
            <h3>Game Phase</h3>
          )}
        </div>
      )}
      <BracketTree participants={participants} />
      <h3>Spectators ({spectators.length}):</h3>
      <ul>
        {spectators.map(spectator => (
          <li key={spectator._id}>{spectator.username}</li>
        ))}
      </ul>
      <p>Gamblers: {gamblerCount}</p>
      {bettingPhase && currentMatch && id && (
        <BettingPhase
          match={currentMatch}
          onStartMatch={handleStartMatch}
          id={id}
          isAdmin={isAdmin}
          bets={bets}
        />
      )}
      {matchInProgress && currentMatch && (
        <MatchResult
          match={currentMatch}
          onSelectWinner={handleMatchResult}
        />
      )}
    </Container>
  );
}

export default BracketPrep;