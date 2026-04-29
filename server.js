const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(express.json());

const PUBLIC_DIR = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : __dirname;

console.log('Serving from:', PUBLIC_DIR);
app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => {
  const idx = path.join(PUBLIC_DIR, 'index.html');
  fs.existsSync(idx) ? res.sendFile(idx) : res.status(404).send('index.html not found in: ' + PUBLIC_DIR);
});
app.get('/ping', (_, res) => res.json({ status: 'ok', uptime: Math.floor(process.uptime()) }));

// ── GIFT LIST ─────────────────────────────────────────────
const GIFTS_FILE = path.join(__dirname, 'gifts-cache.json');
const DEFAULT_GIFTS = [
  {id:'rose',name:'Rose',coins:1,emoji:'🌹'},
  {id:'tiktok',name:'TikTok',coins:1,emoji:'🎵'},
  {id:'finger_heart',name:'Finger Heart',coins:5,emoji:'🤞'},
  {id:'sunglasses',name:'Sunglasses',coins:5,emoji:'🕶'},
  {id:'gg',name:'GG',coins:5,emoji:'🎮'},
  {id:'football',name:'Football',coins:10,emoji:'⚽'},
  {id:'paper_plane',name:'Paper Plane',coins:10,emoji:'✈'},
  {id:'panda',name:'Panda',coins:10,emoji:'🐼'},
  {id:'rainbow',name:'Rainbow',coins:20,emoji:'🌈'},
  {id:'ice_cream',name:'Ice Cream',coins:20,emoji:'🍦'},
  {id:'perfume',name:'Perfume',coins:20,emoji:'🧴'},
  {id:'doughnut',name:'Doughnut',coins:30,emoji:'🍩'},
  {id:'coffee',name:'Coffee',coins:50,emoji:'☕'},
  {id:'crown',name:'Crown',coins:50,emoji:'👑'},
  {id:'cake',name:'Cake',coins:50,emoji:'🎂'},
  {id:'wishing_bottle',name:'Wishing Bottle',coins:99,emoji:'🍾'},
  {id:'sunflower',name:'Sunflower',coins:99,emoji:'🌻'},
  {id:'birthday_cake',name:'Birthday Cake',coins:100,emoji:'🎊'},
  {id:'concert',name:'Concert',coins:100,emoji:'🎤'},
  {id:'rainbow_puke',name:'Rainbow Puke',coins:100,emoji:'🤮'},
  {id:'rose_bouquet',name:'Rose Bouquet',coins:100,emoji:'💐'},
  {id:'rocket',name:'Rocket',coins:100,emoji:'🚀'},
  {id:'diamond',name:'Diamond',coins:200,emoji:'💎'},
  {id:'drama_queen',name:'Drama Queen',coins:500,emoji:'👸'},
  {id:'money_bag',name:'Money Bag',coins:500,emoji:'💰'},
  {id:'money_gun',name:'Money Gun',coins:500,emoji:'💵'},
  {id:'serenade',name:'Serenade',coins:500,emoji:'🎸'},
  {id:'explosion',name:'Explosion',coins:500,emoji:'💥'},
  {id:'ferris_wheel',name:'Ferris Wheel',coins:500,emoji:'🎡'},
  {id:'flying_jets',name:'Flying Jets',coins:500,emoji:'🛩'},
  {id:'star',name:'Star',coins:500,emoji:'⭐'},
  {id:'dragon',name:'Dragon',coins:500,emoji:'🐉'},
  {id:'planet',name:'Planet',coins:500,emoji:'🪐'},
  {id:'sports_car',name:'Sports Car',coins:1000,emoji:'🏎'},
  {id:'lion',name:'Lion',coins:1000,emoji:'🦁'},
  {id:'valentine_box',name:"Valentine's Box",coins:1000,emoji:'💝'},
  {id:'gaming',name:'Gaming',coins:1000,emoji:'🕹'},
  {id:'space_shuttle',name:'Space Shuttle',coins:1000,emoji:'🚀'},
  {id:'boat',name:'Boat',coins:1000,emoji:'⛵'},
  {id:'castle',name:'Castle',coins:1000,emoji:'🏰'},
  {id:'ev_car',name:'EV Car',coins:1000,emoji:'🚗'},
  {id:'fireworks',name:'Fireworks',coins:1088,emoji:'🎆'},
  {id:'yacht',name:'Yacht',coins:2000,emoji:'🛥'},
  {id:'private_jet',name:'Private Jet',coins:3000,emoji:'✈'},
  {id:'interstellar',name:'Interstellar',coins:3000,emoji:'🌌'},
  {id:'island',name:'Island',coins:5000,emoji:'🏝'},
  {id:'aston_martin',name:'Aston Martin',coins:5000,emoji:'🏎'},
  {id:'universe',name:'Universe',coins:5000,emoji:'🌌'},
  {id:'galaxy',name:'Galaxy',coins:10000,emoji:'🌠'},
  {id:'tiktok_universe',name:'TikTok Universe',coins:34999,emoji:'🪐'}
];

function loadGifts() {
  try { if (fs.existsSync(GIFTS_FILE)) return JSON.parse(fs.readFileSync(GIFTS_FILE,'utf8')); } catch(_) {}
  return [...DEFAULT_GIFTS];
}
function saveGifts(gifts) {
  try { fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2)); } catch(_) {}
}

app.get('/api/gifts', (req, res) => res.json(loadGifts()));

app.post('/api/gifts/learn', (req, res) => {
  const { name, coins, emoji, giftId } = req.body || {};
  if (!name) return res.json({ ok:false });
  const gifts = loadGifts();
  const id = (giftId||name).toLowerCase().replace(/[^a-z0-9]/g,'_');
  if (!gifts.find(g => g.id===id || g.name.toLowerCase()===name.toLowerCase())) {
    gifts.push({ id, name, coins:+coins||0, emoji:emoji||'🎁', learned:true });
    gifts.sort((a,b) => a.coins - b.coins);
    saveGifts(gifts);
    console.log('[gift] Learned:', name, coins);
    return res.json({ ok:true, learned:true });
  }
  res.json({ ok:true, learned:false });
});

app.get('/api/gifts/refresh', async (req, res) => {
  try {
    const result = await new Promise((resolve) => {
      const opts = {
        hostname:'webcast.tiktok.com',
        path:'/webcast/gift/list/?aid=1988',
        method:'GET',
        headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'},
        timeout:8000
      };
      const r = https.request(opts, (r2) => {
        let d=''; r2.on('data',c=>d+=c);
        r2.on('end',()=>{ try{resolve(JSON.parse(d));}catch(_){resolve(null);} });
      });
      r.on('error',()=>resolve(null)); r.on('timeout',()=>{r.destroy();resolve(null);}); r.end();
    });
    if (result?.data?.gifts) {
      const gifts = loadGifts(); let added=0;
      result.data.gifts.forEach(g => {
        const id=String(g.id||g.name||'').toLowerCase().replace(/[^a-z0-9]/g,'_');
        const name=g.name||'Unknown'; const coins=g.diamond_count||0;
        if(!gifts.find(ex=>ex.id===id)){gifts.push({id,name,coins,emoji:'🎁',learned:true});added++;}
      });
      if(added){gifts.sort((a,b)=>a.coins-b.coins);saveGifts(gifts);}
      return res.json({ok:true,added,total:gifts.length});
    }
    res.json({ok:false,message:'Could not fetch from TikTok'});
  } catch(e) { res.json({ok:false,message:e.message}); }
});

// ── LIVE STATUS ───────────────────────────────────────────
app.post('/api/live-batch', async (req, res) => {
  const usernames = (req.body.usernames||[]).slice(0,20);
  const results = {};
  await Promise.all(usernames.map(async (username) => {
    const clean = username.replace('@','').trim();
    try {
      const live = await new Promise((resolve) => {
        const opts = {hostname:'www.tiktok.com',path:`/@${clean}/live`,method:'GET',
          headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'},timeout:6000};
        const r = https.request(opts,(r2)=>{
          let d=''; r2.on('data',c=>{d+=c;if(d.length>30000)r.destroy();});
          r2.on('end',()=>resolve(d.includes('"isLive":true')||d.includes('"liveStatus":1')||d.includes('liveRoomUserInfo')));
        });
        r.on('error',()=>resolve(false)); r.on('timeout',()=>{r.destroy();resolve(false);}); r.end();
      });
      results[clean] = live;
    } catch(_) { results[clean]=false; }
  }));
  res.json(results);
});

// ══════════════════════════════════════════════════════════════
// TIKTOK CONNECTOR — Self-healing, version-adaptive adapter
// Automatically adjusts to whichever version of
// tiktok-live-connector is installed, old or new.
// ══════════════════════════════════════════════════════════════

let connectorModule = null;
let connectorVersion = 'unknown';

try {
  connectorModule = require('tiktok-live-connector');
  // Read the actual installed version
  try {
    const pkg = require('./node_modules/tiktok-live-connector/package.json');
    connectorVersion = pkg.version || 'unknown';
  } catch(_) {}
  console.log(`✓ tiktok-live-connector v${connectorVersion} loaded`);
} catch(e) {
  console.error('✗ tiktok-live-connector failed:', e.message);
}

// Detect which API style is available
function getConnectionClass() {
  if (!connectorModule) return null;
  // Newer versions export WebcastPushConnection directly
  if (connectorModule.WebcastPushConnection) return connectorModule.WebcastPushConnection;
  // Some versions use default export
  if (connectorModule.default?.WebcastPushConnection) return connectorModule.default.WebcastPushConnection;
  // Older versions export the class directly
  if (typeof connectorModule === 'function') return connectorModule;
  return null;
}

// Build connection options — tries to work with any version
function buildOptions(sessionId) {
  const base = {
    processInitialData: false,
    requestPollingIntervalMs: 2000,
    clientParams: { app_language: 'en-US', device_platform: 'web' }
  };
  if (sessionId && sessionId.trim().length > 10) {
    // Polling mode with session ID — most reliable
    return { ...base, sessionId: sessionId.trim(), enableWebsocketUpgrade: false };
  }
  // Websocket upgrade without session ID
  return { ...base, enableWebsocketUpgrade: true };
}

// Safely extract a value from a data object — tries multiple field names
// This handles TikTok changing field names between versions
function safeGet(obj, ...keys) {
  for (const key of keys) {
    try {
      const val = key.split('.').reduce((o, k) => o?.[k], obj);
      if (val !== undefined && val !== null) return val;
    } catch(_) {}
  }
  return null;
}

// Wire all events with multi-field fallbacks
// so renamed fields in new library versions still work
function wireEvents(conn, socket, clean) {
  const safe = (fn) => (...args) => { try { fn(...args); } catch(e) { console.error('[event error]', e.message); } };

  conn.on('chat', safe(d => {
    socket.emit('event', {
      type: 'comment',
      username: safeGet(d,'uniqueId','userId','user.uniqueId','nickname') || 'Someone',
      text: safeGet(d,'comment','content','message','text') || ''
    });
  }));

  conn.on('gift', safe(d => {
    // Skip mid-streak gifts — only fire when streak ends
    const streakable = safeGet(d,'gift.streakable','giftType');
    const streaking  = safeGet(d,'streaking','repeatEnd');
    if (streakable === 1 && streaking !== true && streaking !== false) return;
    if (streakable === true && streaking === true) return;

    const giftName = safeGet(d,'giftName','gift.name','gift_name') || 'Gift';
    const coins    = safeGet(d,'diamondCount','gift.diamondCount','diamond_count','coins') || 0;
    const giftId   = safeGet(d,'giftId','gift.id','gift_id') || giftName;

    socket.emit('event', {
      type: 'gift',
      username: safeGet(d,'uniqueId','userId','user.uniqueId','nickname') || 'Someone',
      giftName, coins,
      repeatCount: safeGet(d,'repeatCount','repeat_count') || 1,
      emoji: '🎁', giftId: String(giftId)
    });

    // Auto-learn gift on server
    try {
      const body = JSON.stringify({ name: giftName, coins, emoji: '🎁', giftId: String(giftId) });
      https.request({ hostname:'localhost', port:PORT, path:'/api/gifts/learn', method:'POST',
        headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)} },
        ()=>{}
      ).on('error',()=>{}).end(body);
    } catch(_) {}
  }));

  conn.on('follow', safe(d => {
    socket.emit('event', { type:'follow', username: safeGet(d,'uniqueId','user.uniqueId','nickname') || 'Someone' });
  }));

  // Some versions use 'social' for follow/share
  conn.on('social', safe(d => {
    const type = d.followEvent || d.follow ? 'follow' : 'share';
    socket.emit('event', { type, username: safeGet(d,'uniqueId','user.uniqueId','nickname') || 'Someone' });
  }));

  conn.on('share', safe(d => {
    socket.emit('event', { type:'share', username: safeGet(d,'uniqueId','user.uniqueId','nickname') || 'Someone' });
  }));

  conn.on('subscribe', safe(d => {
    socket.emit('event', { type:'subscribe', username: safeGet(d,'uniqueId','user.uniqueId','nickname') || 'Someone' });
  }));

  conn.on('member', safe(d => {
    // Some versions fire 'member' for joins
    socket.emit('event', { type:'member', username: safeGet(d,'uniqueId','user.uniqueId','nickname') || 'Someone' });
  }));

  conn.on('roomUser', safe(d => {
    socket.emit('event', { type:'viewer_count', count: safeGet(d,'viewerCount','viewer_count','totalUserCount') || 0 });
  }));

  conn.on('roomStats', safe(d => {
    socket.emit('event', { type:'viewer_count', count: safeGet(d,'viewerCount','viewer_count') || 0 });
  }));

  conn.on('like', safe(d => {
    socket.emit('event', {
      type:'like',
      username: safeGet(d,'uniqueId','user.uniqueId') || 'Someone',
      count: safeGet(d,'likeCount','like_count','count') || 1
    });
  }));

  conn.on('streamEnd', safe(() => {
    socket.emit('tiktok-disconnected', { reason:'Stream has ended.' });
  }));

  conn.on('disconnect', safe(() => {
    socket.emit('tiktok-disconnected', { reason:'Disconnected from TikTok.' });
  }));

  conn.on('error', safe(e => {
    const m = e?.message || String(e);
    console.error(`[conn error] @${clean}:`, m);
    socket.emit('tiktok-error', { message: m });
  }));
}

// Friendly error messages — catches errors across all library versions
function friendlyError(msg) {
  if (!msg) return 'Connection failed. Please try again.';
  const m = msg.toLowerCase();
  if (m.includes('sessionid') || m.includes('websocket') || m.includes('upgrade') || m.includes('sign'))
    return 'SESSION_ID_NEEDED';
  if (m.includes('cannot read') || m.includes('undefined') || m.includes('status') || m.includes('null'))
    return 'Connection failed. Make sure the stream is live and your Session ID is fresh. Log out of TikTok and back in to get a new one.';
  if (m.includes('live') || m.includes('not started') || m.includes('room'))
    return 'Stream not found or not live. Make sure the stream is already live before connecting.';
  if (m.includes('not found') || m.includes('404') || m.includes('user'))
    return 'Username not found on TikTok. Check the spelling and try again.';
  if (m.includes('timeout') || m.includes('timed out'))
    return 'Connection timed out. Please try again.';
  if (m.includes('rate') || m.includes('429'))
    return 'Too many requests. Wait a moment and try again.';
  return `Connection error: ${msg.slice(0, 120)}`;
}

const sessions = new Map();

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('connect-tiktok', async ({ username, sessionId }) => {
    const clean = (username || '').replace('@', '').trim();
    if (!clean) return socket.emit('tiktok-error', { message: 'Please enter a valid TikTok username.' });

    // Clean up existing session
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).disconnect(); } catch(_) {}
      sessions.delete(socket.id);
    }

    const ConnClass = getConnectionClass();
    if (!ConnClass) {
      return socket.emit('tiktok-error', { message: 'TikTok connector not installed on server. Contact the app owner.' });
    }

    socket.emit('tiktok-connecting', { username: clean });
    console.log(`[→] Connecting @${clean} | v${connectorVersion} | sessionId=${sessionId ? 'yes' : 'no'}`);

    // Try connecting — attempt 1: with provided options
    // If it fails with a version-specific error, try alternate options
    const attempts = [
      buildOptions(sessionId),
      // Fallback: minimal options (works with some older versions)
      { processInitialData: false, enableWebsocketUpgrade: !!sessionId,
        ...(sessionId ? { sessionId: sessionId.trim() } : {}) },
      // Last resort: completely bare options
      {}
    ];

    let lastError = null;

    for (let i = 0; i < attempts.length; i++) {
      try {
        console.log(`[→] Attempt ${i+1} with options:`, Object.keys(attempts[i]).join(','));
        const conn = new ConnClass(clean, attempts[i]);
        wireEvents(conn, socket, clean);
        const state = await conn.connect();
        sessions.set(socket.id, conn);
        console.log(`[✓] @${clean} connected on attempt ${i+1}`);
        socket.emit('tiktok-connected', {
          username: clean,
          roomId: safeGet(state, 'roomId', 'room_id', 'roomInfo.roomId') || ''
        });
        return; // Success — stop trying
      } catch(err) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[~] Attempt ${i+1} failed: ${msg.slice(0,80)}`);
        // If it's a known fatal error, don't bother retrying
        if (msg.includes('not found') || msg.includes('404') || msg.includes('username')) break;
        // Small delay before retry
        if (i < attempts.length - 1) await new Promise(r => setTimeout(r, 800));
      }
    }

    // All attempts failed
    sessions.delete(socket.id);
    const errMsg = lastError?.message || String(lastError) || 'Unknown error';
    console.error(`[✗] @${clean} all attempts failed:`, errMsg);
    socket.emit('tiktok-error', { message: friendlyError(errMsg) });
  });

  socket.on('disconnect-tiktok', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).disconnect(); } catch(_) {}
      sessions.delete(socket.id);
    }
    socket.emit('tiktok-disconnected', { reason: 'Disconnected manually.' });
  });

  socket.on('disconnect', () => {
    if (sessions.has(socket.id)) {
      try { sessions.get(socket.id).disconnect(); } catch(_) {}
      sessions.delete(socket.id);
    }
    console.log(`[-] ${socket.id}`);
  });
});

if(process.env.RENDER_EXTERNAL_URL){
  setInterval(()=>{https.get(`${process.env.RENDER_EXTERNAL_URL}/ping`).on('error',()=>{});},14*60*1000);
}

const PORT = process.env.PORT||3000;
httpServer.listen(PORT,()=>console.log(`\n🎙 TikTok Live Announcer — port ${PORT}\n`));
