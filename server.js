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

// Serve files from public/ or root
const PUBLIC_DIR = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;

console.log('Serving from:', PUBLIC_DIR);

app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => {
  const idx = path.join(PUBLIC_DIR, 'index.html');
  fs.existsSync(idx) ? res.sendFile(idx) : res.status(404).send('index.html not found');
});
app.get('/ping', (_, res) => res.json({ status: 'ok' }));

// ── Active TikTok sessions ────────────────────────────────
const sessions = new Map();

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('connect-tiktok', async ({ username }) => {
    const clean = (username || '').replace('@', '').trim();
    if (!clean) return socket.emit('tiktok-error', { message: 'Please enter a valid TikTok username.' });

    // Clean up any existing session
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }

    socket.emit('tiktok-connecting', { username: clean });

    try {
      const { TikTokLiveClient, EventType } = require('piratetok-live-js');

      const client = new TikTokLiveClient(clean);
      sessions.set(socket.id, client);

      // ── CHAT ──────────────────────────────────────────
      client.on(EventType.chat, (data) => {
        socket.emit('event', {
          type: 'comment',
          username: data.user?.uniqueId || data.user?.nickname || 'Someone',
          text: data.content || data.comment || ''
        });
      });

      // ── GIFTS ─────────────────────────────────────────
      client.on(EventType.gift, (data) => {
        // Only fire when streak ends (or non-streakable)
        if (data.gift?.streakable && data.streaking) return;
        socket.emit('event', {
          type: 'gift',
          username: data.user?.uniqueId || data.user?.nickname || 'Someone',
          giftName: data.gift?.name || 'Gift',
          coins: data.gift?.diamondCount || 0,
          repeatCount: data.repeatCount || 1,
          emoji: '🎁'
        });
      });

      // ── FOLLOW / SHARE ────────────────────────────────
      client.on(EventType.social, (data) => {
        if (data.followEvent) {
          socket.emit('event', {
            type: 'follow',
            username: data.user?.uniqueId || data.user?.nickname || 'Someone'
          });
        } else {
          socket.emit('event', {
            type: 'share',
            username: data.user?.uniqueId || data.user?.nickname || 'Someone'
          });
        }
      });

      // ── SUBSCRIBE ─────────────────────────────────────
      client.on(EventType.subscribe, (data) => {
        socket.emit('event', {
          type: 'subscribe',
          username: data.user?.uniqueId || data.user?.nickname || 'Someone'
        });
      });

      // ── VIEWER COUNT ──────────────────────────────────
      client.on(EventType.roomStats, (data) => {
        socket.emit('event', {
          type: 'viewer_count',
          count: data.viewerCount || 0
        });
      });

      // ── LIKES ─────────────────────────────────────────
      client.on(EventType.like, (data) => {
        socket.emit('event', {
          type: 'like',
          username: data.user?.uniqueId || 'Someone',
          count: data.likeCount || 0,
          total: data.total || 0
        });
      });

      // ── MEMBER JOIN ───────────────────────────────────
      client.on(EventType.member, (data) => {
        socket.emit('event', {
          type: 'member',
          username: data.user?.uniqueId || data.user?.nickname || 'Someone'
        });
      });

      // ── DISCONNECT ────────────────────────────────────
      client.on(EventType.disconnect, () => {
        socket.emit('tiktok-disconnected', { reason: 'Stream ended or connection lost.' });
        sessions.delete(socket.id);
      });

      // ── ERROR ─────────────────────────────────────────
      client.on(EventType.error, (err) => {
        console.error(`TikTok error [${socket.id}]:`, err?.message || err);
        socket.emit('tiktok-error', { message: err?.message || 'Connection error.' });
      });

      // ── CONNECT ───────────────────────────────────────
      await client.connect();
      console.log(`[✓] Connected: @${clean}`);
      socket.emit('tiktok-connected', { username: clean });

    } catch (err) {
      sessions.delete(socket.id);
      console.error(`[!] Failed: @${clean}`, err?.message);
      let msg = err?.message || 'Could not connect.';
      if (msg.includes('live') || msg.includes('LIVE')) msg = 'Is the stream currently live?';
      else if (msg.includes('not found') || msg.includes('404')) msg = 'Username not found on TikTok.';
      socket.emit('tiktok-error', { message: msg });
    }
  });

  socket.on('disconnect-tiktok', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    socket.emit('tiktok-disconnected', { reason: 'Disconnected.' });
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
  console.log(`\n🎙 TikTok Live Announcer — port ${PORT}\n`);
});
