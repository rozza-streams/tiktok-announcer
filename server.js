const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const PUBLIC_DIR = fs.existsSync(path.join(__dirname, 'public')) ? path.join(__dirname, 'public') : __dirname;
console.log('Serving from:', PUBLIC_DIR);

app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => {
  const idx = path.join(PUBLIC_DIR, 'index.html');
  fs.existsSync(idx) ? res.sendFile(idx) : res.status(404).send('index.html not found');
});
app.get('/ping', (_, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Detect which connector is installed
let CONNECTOR = null, CONNECTOR_NAME = '';
try { CONNECTOR = require('tiktok-live-connector'); CONNECTOR_NAME = 'tiktok-live-connector'; console.log('✓ tiktok-live-connector loaded'); }
catch (e) { console.log('✗ tiktok-live-connector:', e.message); }
if (!CONNECTOR) {
  try { CONNECTOR = require('piratetok-live-js'); CONNECTOR_NAME = 'piratetok-live-js'; console.log('✓ piratetok-live-js loaded'); }
  catch (e) { console.log('✗ piratetok-live-js:', e.message); }
}
console.log('Active connector:', CONNECTOR_NAME || 'NONE — use simulation mode');

const sessions = new Map();

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('connect-tiktok', async ({ username }) => {
    const clean = (username || '').replace('@', '').trim();
    if (!clean) return socket.emit('tiktok-error', { message: 'Please enter a valid TikTok username.' });

    if (sessions.has(socket.id)) {
      try { const old = sessions.get(socket.id); if (old?.disconnect) old.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }

    socket.emit('tiktok-connecting', { username: clean });
    console.log(`[→] Connecting @${clean} via ${CONNECTOR_NAME}`);

    if (!CONNECTOR) {
      return socket.emit('tiktok-error', { message: 'No TikTok connector installed on server. Use Simulation Mode to test all features.' });
    }

    try {
      if (CONNECTOR_NAME === 'tiktok-live-connector') {
        const { WebcastPushConnection } = CONNECTOR;
        const conn = new WebcastPushConnection(clean, {
          processInitialData: false,
          enableWebsocketUpgrade: false,
          requestPollingIntervalMs: 2000,
          clientParams: { app_language: 'en-US', device_platform: 'web' }
        });
        sessions.set(socket.id, conn);
        wireEvents(socket, conn, 'tlc');
        const state = await conn.connect();
        console.log(`[✓] @${clean} connected, room: ${state?.roomId}`);
        socket.emit('tiktok-connected', { username: clean, roomId: state?.roomId || '' });

      } else {
        const { TikTokLiveClient, EventType } = CONNECTOR;
        const client = new TikTokLiveClient(clean);
        sessions.set(socket.id, client);
        wireEvents(socket, client, 'pirate', EventType);
        await client.connect();
        console.log(`[✓] @${clean} piratetok connected`);
        socket.emit('tiktok-connected', { username: clean });
      }

    } catch (err) {
      sessions.delete(socket.id);
      const raw = err?.message || String(err);
      console.error(`[!] @${clean} failed:`, raw);
      // Show REAL error so we can see what's happening
      socket.emit('tiktok-error', { message: raw });
    }
  });

  socket.on('disconnect-tiktok', () => {
    if (sessions.has(socket.id)) {
      try { const s = sessions.get(socket.id); if (s?.disconnect) s.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    socket.emit('tiktok-disconnected', { reason: 'Disconnected manually.' });
  });

  socket.on('disconnect', () => {
    if (sessions.has(socket.id)) {
      try { const s = sessions.get(socket.id); if (s?.disconnect) s.disconnect(); } catch (_) {}
      sessions.delete(socket.id);
    }
    console.log(`[-] ${socket.id}`);
  });
});

function wireEvents(socket, emitter, mode, EventType) {
  const on = (ev, fn) => emitter.on(ev, fn);

  if (mode === 'tlc') {
    on('chat',      d => socket.emit('event', { type:'comment',      username: d.uniqueId||d.nickname||'Someone', text: d.comment||'' }));
    on('gift',      d => { if(d.giftType===1&&!d.repeatEnd) return; socket.emit('event', { type:'gift', username:d.uniqueId||d.nickname||'Someone', giftName:d.giftName||'Gift', coins:d.diamondCount||0, repeatCount:d.repeatCount||1, emoji:'🎁' }); });
    on('follow',    d => socket.emit('event', { type:'follow',       username: d.uniqueId||d.nickname||'Someone' }));
    on('share',     d => socket.emit('event', { type:'share',        username: d.uniqueId||d.nickname||'Someone' }));
    on('subscribe', d => socket.emit('event', { type:'subscribe',    username: d.uniqueId||d.nickname||'Someone' }));
    on('roomUser',  d => socket.emit('event', { type:'viewer_count', count: d.viewerCount||0 }));
    on('streamEnd', () => { socket.emit('tiktok-disconnected', { reason:'Stream ended.' }); });
    on('disconnect',() => { socket.emit('tiktok-disconnected', { reason:'Disconnected.' }); });
    on('error',     e => socket.emit('tiktok-error', { message: e?.message||String(e) }));
  } else {
    const ET = EventType || {};
    on(ET.chat||'chat',           d => socket.emit('event', { type:'comment',      username:d.user?.uniqueId||d.uniqueId||'Someone', text:d.content||d.comment||'' }));
    on(ET.gift||'gift',           d => { if(d.gift?.streakable&&d.streaking) return; socket.emit('event', { type:'gift', username:d.user?.uniqueId||d.uniqueId||'Someone', giftName:d.gift?.name||d.giftName||'Gift', coins:d.gift?.diamondCount||d.diamondCount||0, repeatCount:d.repeatCount||1, emoji:'🎁' }); });
    on(ET.social||'social',       d => socket.emit('event', { type: d.followEvent?'follow':'share', username:d.user?.uniqueId||d.uniqueId||'Someone' }));
    on(ET.follow||'follow',       d => socket.emit('event', { type:'follow',       username:d.user?.uniqueId||d.uniqueId||'Someone' }));
    on(ET.subscribe||'subscribe', d => socket.emit('event', { type:'subscribe',    username:d.user?.uniqueId||d.uniqueId||'Someone' }));
    on(ET.roomStats||'roomStats', d => socket.emit('event', { type:'viewer_count', count:d.viewerCount||0 }));
    on(ET.disconnect||'disconnect',()=> socket.emit('tiktok-disconnected', { reason:'Stream ended or disconnected.' }));
    on(ET.error||'error',          e => socket.emit('tiktok-error', { message:e?.message||String(e) }));
  }
}

if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => { require('https').get(`${process.env.RENDER_EXTERNAL_URL}/ping`).on('error',()=>{}); }, 14*60*1000);
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`\n🎙 TikTok Live Announcer — port ${PORT}\nConnector: ${CONNECTOR_NAME||'none'}\n`));
