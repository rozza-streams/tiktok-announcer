const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Active TikTok sessions: socketId -> { connection, username }
const sessions = new Map();

function forwardGiftEmoji(giftId) {
  const map = { 5655: '🌹', 5665: '🎵', 6368: '⚽', 7496: '🍦', 6212: '👑', 6748: '🚀', 6406: '💎', 7119: '🐉', 6083: '🦁', 7572: '🌌' };
  return map[giftId] || '🎁';
}

io.on('connection', (socket) => {
  console.log(`[+] Client connected: ${socket.id}`);

  // ── CONNECT TO TIKTOK ───────────────────────────────────
  socket.on('connect-tiktok', async ({ username }) => {
    const clean = username.replace('@', '').trim();
    if (!clean) return socket.emit('tiktok-error', { message: 'Please enter a valid TikTok username.' });

    // Disconnect existing session if any
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).connection.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }

    socket.emit('tiktok-connecting', { username: clean });

    try {
      const connection = new WebcastPushConnection(clean, {
        processInitialData: false,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 2000,
        sessionId: undefined,
        clientParams: { app_language: 'en-US', device_platform: 'web' }
      });

      sessions.set(socket.id, { connection, username: clean });

      // ── CHAT ────────────────────────────────────────────
      connection.on('chat', (data) => {
        socket.emit('event', {
          type: 'comment',
          username: data.uniqueId || data.nickname || 'Someone',
          displayName: data.nickname || data.uniqueId || 'Someone',
          text: data.comment || '',
          followRole: data.followRole || 0,
          userBadges: data.userBadges || []
        });
      });

      // ── GIFTS ───────────────────────────────────────────
      connection.on('gift', (data) => {
        // For streaked gifts, only fire when streak ends
        if (data.giftType === 1 && !data.repeatEnd) return;
        socket.emit('event', {
          type: 'gift',
          username: data.uniqueId || data.nickname || 'Someone',
          displayName: data.nickname || data.uniqueId || 'Someone',
          giftName: data.giftName || 'Gift',
          coins: data.diamondCount || 0,
          giftId: data.giftId,
          repeatCount: data.repeatCount || 1,
          emoji: forwardGiftEmoji(data.giftId)
        });
      });

      // ── FOLLOW ──────────────────────────────────────────
      connection.on('follow', (data) => {
        socket.emit('event', {
          type: 'follow',
          username: data.uniqueId || 'Someone',
          displayName: data.nickname || data.uniqueId || 'Someone'
        });
      });

      // ── SHARE ───────────────────────────────────────────
      connection.on('share', (data) => {
        socket.emit('event', {
          type: 'share',
          username: data.uniqueId || 'Someone',
          displayName: data.nickname || data.uniqueId || 'Someone'
        });
      });

      // ── SUBSCRIBER ──────────────────────────────────────
      connection.on('subscribe', (data) => {
        socket.emit('event', {
          type: 'subscribe',
          username: data.uniqueId || 'Someone',
          displayName: data.nickname || data.uniqueId || 'Someone'
        });
      });

      // ── VIEWER COUNT ─────────────────────────────────── 
      connection.on('roomUser', (data) => {
        socket.emit('event', {
          type: 'viewer_count',
          count: data.viewerCount || 0
        });
      });

      // ── LIKES ───────────────────────────────────────────
      connection.on('like', (data) => {
        socket.emit('event', {
          type: 'like',
          username: data.uniqueId || 'Someone',
          count: data.likeCount || 0,
          totalLikeCount: data.totalLikeCount || 0
        });
      });

      // ── MOD ACTIONS ─────────────────────────────────────
      connection.on('streamEnd', () => {
        socket.emit('tiktok-disconnected', { reason: 'Stream has ended.' });
      });

      connection.on('disconnect', () => {
        socket.emit('tiktok-disconnected', { reason: 'Disconnected from TikTok.' });
      });

      connection.on('error', (err) => {
        console.error(`[!] TikTok error for ${socket.id}:`, err.message);
        socket.emit('tiktok-error', { message: err.message || 'TikTok connection error.' });
      });

      // ── CONNECT ─────────────────────────────────────────
      const state = await connection.connect();
      console.log(`[✓] TikTok connected for ${socket.id}: @${clean}`);
      socket.emit('tiktok-connected', {
        username: clean,
        roomId: state.roomId || '',
        viewerCount: state.roomInfo?.stats?.fan_ticket || 0
      });

    } catch (err) {
      console.error(`[!] Connect failed for ${socket.id}:`, err.message);
      sessions.delete(socket.id);
      let msg = 'Could not connect. ';
      if (err.message.includes('LIVE')) msg += 'Is the stream currently live?';
      else if (err.message.includes('User not found')) msg += 'Username not found on TikTok.';
      else msg += err.message;
      socket.emit('tiktok-error', { message: msg });
    }
  });

  // ── DISCONNECT FROM TIKTOK ──────────────────────────────
  socket.on('disconnect-tiktok', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).connection.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    socket.emit('tiktok-disconnected', { reason: 'Disconnected manually.' });
  });

  // ── SOCKET DISCONNECT ───────────────────────────────────
  socket.on('disconnect', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).connection.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    console.log(`[-] Client disconnected: ${socket.id}`);
  });
});

// ── HEALTH CHECK (keeps Render free tier alive) ──────────
app.get('/ping', (_, res) => res.send('pong'));

// Keep-alive self-ping every 14 minutes on Render free tier
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    const https = require('https');
    https.get(`${process.env.RENDER_EXTERNAL_URL}/ping`).on('error', () => {});
  }, 14 * 60 * 1000);
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`\n🎙  TikTok Live Announcer`);
  console.log(`📡  Server running on port ${PORT}`);
  console.log(`🌍  Open http://localhost:${PORT}\n`);
});
