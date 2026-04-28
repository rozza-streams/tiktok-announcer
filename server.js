const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Serve from public/ if it exists, otherwise serve from root
const PUBLIC_DIR = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;

console.log('Serving static files from:', PUBLIC_DIR);
console.log('Files available:', fs.readdirSync(PUBLIC_DIR).filter(f => !f.includes('node_modules')));

app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found. Files: ' + fs.readdirSync(PUBLIC_DIR).join(', '));
  }
});

app.get('/ping', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── TikTok Live sessions ──────────────────────────────────
const sessions = new Map();

io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  socket.on('connect-tiktok', async ({ username }) => {
    const clean = (username || '').replace('@', '').trim();
    if (!clean) return socket.emit('tiktok-error', { message: 'Please enter a valid TikTok username.' });

    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).connection.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }

    socket.emit('tiktok-connecting', { username: clean });

    let WebcastPushConnection;
    try {
      ({ WebcastPushConnection } = require('tiktok-live-connector'));
    } catch (e) {
      return socket.emit('tiktok-error', { message: 'TikTok connector not available. Use Simulation Mode instead.' });
    }

    try {
      const connection = new WebcastPushConnection(clean, {
        processInitialData: false,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 2000,
        clientParams: { app_language: 'en-US', device_platform: 'web' }
      });

      sessions.set(socket.id, { connection, username: clean });

      connection.on('chat', (data) => {
        socket.emit('event', {
          type: 'comment',
          username: data.uniqueId || data.nickname || 'Someone',
          text: data.comment || ''
        });
      });

      connection.on('gift', (data) => {
        if (data.giftType === 1 && !data.repeatEnd) return;
        socket.emit('event', {
          type: 'gift',
          username: data.uniqueId || data.nickname || 'Someone',
          giftName: data.giftName || 'Gift',
          coins: data.diamondCount || 0,
          repeatCount: data.repeatCount || 1,
          emoji: '🎁'
        });
      });

      connection.on('follow', (data) => {
        socket.emit('event', { type: 'follow', username: data.uniqueId || data.nickname || 'Someone' });
      });

      connection.on('share', (data) => {
        socket.emit('event', { type: 'share', username: data.uniqueId || data.nickname || 'Someone' });
      });

      connection.on('subscribe', (data) => {
        socket.emit('event', { type: 'subscribe', username: data.uniqueId || data.nickname || 'Someone' });
      });

      connection.on('roomUser', (data) => {
        socket.emit('event', { type: 'viewer_count', count: data.viewerCount || 0 });
      });

      connection.on('streamEnd', () => {
        socket.emit('tiktok-disconnected', { reason: 'Stream has ended.' });
      });

      connection.on('disconnect', () => {
        socket.emit('tiktok-disconnected', { reason: 'Disconnected from TikTok.' });
      });

      connection.on('error', (err) => {
        socket.emit('tiktok-error', { message: err.message || 'TikTok error.' });
      });

      const state = await connection.connect();
      console.log(`[✓] TikTok connected: @${clean}`);
      socket.emit('tiktok-connected', { username: clean, roomId: state.roomId || '' });

    } catch (err) {
      sessions.delete(socket.id);
      let msg = 'Could not connect. ';
      if (err.message && err.message.includes('LIVE')) msg += 'Is the stream currently live?';
      else if (err.message && err.message.includes('not found')) msg += 'Username not found.';
      else msg += (err.message || 'Unknown error.');
      socket.emit('tiktok-error', { message: msg });
    }
  });

  socket.on('disconnect-tiktok', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).connection.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    socket.emit('tiktok-disconnected', { reason: 'Disconnected manually.' });
  });

  socket.on('disconnect', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).connection.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    console.log(`[-] Disconnected: ${socket.id}`);
  });
});

// Keep Render free tier alive
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    require('https').get(`${process.env.RENDER_EXTERNAL_URL}/ping`).on('error', () => {});
  }, 14 * 60 * 1000);
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`\n🎙  TikTok Live Announcer — port ${PORT}\n`);
});
