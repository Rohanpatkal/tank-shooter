/*// File: /client/src/App.js
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://localhost:4000'); // Use your server URL here
 //const socket = io('https://tank-shooter-server.onrender.com');

function App() {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    socket.on('init', (data) => {
      setPlayers(data);
      setPlayerId(socket.id);
    });

    socket.on('new-player', player => {
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    });

    socket.on('players-update', updatedPlayers => {
      setPlayers(updatedPlayers);
    });

    socket.on('player-disconnect', id => {
      setPlayers(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[id];
        return newPlayers;
      });
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Object.values(players).forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = 'green';
        ctx.fillRect(-15, -15, 30, 30); // tank
        ctx.fillStyle = 'black';
        ctx.fillRect(0, -5, 20, 10); // cannon
        ctx.restore();
      });
    };

    const interval = setInterval(draw, 1000 / 60);
    return () => clearInterval(interval);
  }, [players]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!playerId) return;
      const player = players[playerId];
      if (!player) return;

      const speed = 5;
      let { x, y, angle } = player;
      if (e.key === 'ArrowUp') y -= speed;
      if (e.key === 'ArrowDown') y += speed;
      if (e.key === 'ArrowLeft') angle -= 0.1;
      if (e.key === 'ArrowRight') angle += 0.1;
      if (e.key === ' ') {
        const bullet = {
          x: x + Math.cos(angle) * 30,
          y: y + Math.sin(angle) * 30,
          angle
        };
        socket.emit('shoot', bullet);
      }
      socket.emit('move', { x, y, angle });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [players, playerId]);

  return (
    <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
  );
}

export default App;
*/
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://tank-shooter-server.onrender.com'); // Use your server URL or localhost

function App() {
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    // Send ping every second
    const interval = setInterval(() => {
      const start = Date.now();
      socket.emit('ping-check', start);
    }, 1000);

    // Receive pong from server
    socket.on('pong-check', (sentTime) => {
      const ping = Date.now() - sentTime;
      setLatency(ping);
    });

    return () => {
      clearInterval(interval);
      socket.off('pong-check');
    };
  }, []);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem'
    }}>
      Latency: {latency !== null ? `${latency} ms` : 'Checking...'}
    </div>
  );
}

export default App;
