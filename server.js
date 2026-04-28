const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const PUBLIC_DIR = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;

console.log('Serving from:', PUBLIC_DIR);
console.log('Files:', fs.readdirSync(PUBLIC_DIR).filter(f => !['node_modules','.git'].includes(f)));

app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => {
  const idx = path.join(PUBLIC_DIR, 'index.html');
  fs.existsSync(idx) ? res.sendFile(idx) : res.status(404).send('index.html not found');
});
app.get('/ping', (_, res) => res.json({ status: 'ok', uptime: Math.floor(process.uptime()) }));

// ── TikTok connector ──────────────────────────────────────
let WebcastPushConnection = null;
try {
  ({ WebcastPushConnection } = require('tiktok-live-connector'));
  console.log('✓ tiktok-live-connector ready');
} catch (e) {
  console.error('✗ tiktok-live-connector failed to load:', e.message);
}

const sessions = new Map();

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('connect-tiktok', async ({ username, sessionId }) => {
    const clean = (username || '').replace('@', '').trim();
    if (!clean) return socket.emit('tiktok-error', { message: 'Please enter a valid TikTok username.' });

    // Clean up old session
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }

    if (!WebcastPushConnection) {
      return socket.emit('tiktok-error', {
        message: 'TikTok connector not loaded on server. Check Render logs.'
      });
    }

    socket.emit('tiktok-connecting', { username: clean });
    console.log(`[→] @${clean} sessionId=${sessionId ? 'provided' : 'none'}`);

    try {
      const options = {
        processInitialData: false,
        requestPollingIntervalMs: 2000,
        clientParams: { app_language: 'en-US', device_platform: 'web' }
      };

      if (sessionId && sessionId.trim().length > 10) {
        // Session ID provided — use polling (most reliable)
        options.sessionId = sessionId.trim();
        options.enableWebsocketUpgrade = false;
        console.log('[→] Using polling with sessionId');
      } else {
        // No session ID — try websocket (may fail on newer TikTok versions)
        options.enableWebsocketUpgrade = true;
        console.log('[→] Attempting websocket (no sessionId)');
      }

      const connection = new WebcastPushConnection(clean, options);
      sessions.set(socket.id, connection);

      connection.on('chat', d => socket.emit('event', {
        type: 'comment',
        username: d.uniqueId || d.nickname || 'Someone',
        text: d.comment || ''
      }));

      connection.on('gift', d => {
        if (d.giftType === 1 && !d.repeatEnd) return;
        socket.emit('event', {
          type: 'gift',
          username: d.uniqueId || d.nickname || 'Someone',
          giftName: d.giftName || 'Gift',
          coins: d.diamondCount || 0,
          repeatCount: d.repeatCount || 1,
          emoji: '🎁'
        });
      });

      connection.on('follow', d => socket.emit('event', {
        type: 'follow', username: d.uniqueId || d.nickname || 'Someone'
      }));

      connection.on('share', d => socket.emit('event', {
        type: 'share', username: d.uniqueId || d.nickname || 'Someone'
      }));

      connection.on('subscribe', d => socket.emit('event', {
        type: 'subscribe', username: d.uniqueId || d.nickname || 'Someone'
      }));

      connection.on('roomUser', d => socket.emit('event', {
        type: 'viewer_count', count: d.viewerCount || 0
      }));

      connection.on('like', d => socket.emit('event', {
        type: 'like', username: d.uniqueId || 'Someone', count: d.likeCount || 0
      }));

      connection.on('streamEnd', () => {
        socket.emit('tiktok-disconnected', { reason: 'Stream has ended.' });
        sessions.delete(socket.id);
      });

      connection.on('disconnect', () => {
        socket.emit('tiktok-disconnected', { reason: 'Disconnected from TikTok.' });
        sessions.delete(socket.id);
      });

      connection.on('error', err => {
        const msg = err?.message || String(err);
        console.error(`[!] Error @${clean}:`, msg);
        socket.emit('tiktok-error', { message: msg });
      });

      const state = await connection.connect();
      console.log(`[✓] Connected @${clean} room:${state?.roomId}`);
      socket.emit('tiktok-connected', { username: clean, roomId: state?.roomId || '' });

    } catch (err) {
      sessions.delete(socket.id);
      const msg = err?.message || String(err);
      console.error(`[!] Failed @${clean}:`, msg);

      // Friendly error messages
      let friendly = msg;
      if (msg.includes('sessionId') || msg.includes('websocket') || msg.includes('upgrade')) {
        friendly = 'SESSION_ID_NEEDED';
      } else if (msg.includes('LIVE') || msg.includes('live') || msg.includes('not started')) {
        friendly = 'Stream not found or not live. Make sure you are live on TikTok first.';
      } else if (msg.includes('not found') || msg.includes('404') || msg.includes('user')) {
        friendly = 'Username not found on TikTok. Check the spelling and try again.';
      }

      socket.emit('tiktok-error', { message: friendly });
    }
  });

  socket.on('disconnect-tiktok', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    socket.emit('tiktok-disconnected', { reason: 'Disconnected manually.' });
  });

  socket.on('disconnect', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    console.log(`[-] ${socket.id}`);
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
  console.log(`\n🎙  TikTok Live Announcer`);
  console.log(`📡  Port: ${PORT}`);
  console.log(`📁  Files: ${PUBLIC_DIR}\n`);
});
