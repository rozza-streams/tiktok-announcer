const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET','POST'] } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
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
  {id:'doughnut',name:'Doughnut',coins:30,emoji:'🍩'},
  {id:'rainbow',name:'Rainbow',coins:20,emoji:'🌈'},
  {id:'ice_cream',name:'Ice Cream',coins:20,emoji:'🍦'},
  {id:'perfume',name:'Perfume',coins:20,emoji:'🧴'},
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
function saveGifts(g) { try { fs.writeFileSync(GIFTS_FILE, JSON.stringify(g,null,2)); } catch(_) {} }

app.get('/api/gifts', (_, res) => res.json(loadGifts()));
app.post('/api/gifts/learn', (req, res) => {
  const { name, coins, emoji } = req.body || {};
  if (!name) return res.json({ ok:false });
  const gifts = loadGifts();
  const id = name.toLowerCase().replace(/[^a-z0-9]/g,'_');
  if (!gifts.find(g => g.id===id || g.name.toLowerCase()===name.toLowerCase())) {
    gifts.push({ id, name, coins:+coins||0, emoji:emoji||'🎁', learned:true });
    gifts.sort((a,b) => a.coins-b.coins);
    saveGifts(gifts);
    return res.json({ ok:true, learned:true });
  }
  res.json({ ok:true, learned:false });
});

// ── LIVE STATUS CHECK ─────────────────────────────────────
app.post('/api/live-batch', async (req, res) => {
  const usernames = (req.body.usernames||[]).slice(0,20);
  const results = {};
  await Promise.all(usernames.map(async (u) => {
    const clean = u.replace('@','').trim();
    try {
      const live = await new Promise((resolve) => {
        const opts = { hostname:'www.tiktok.com', path:`/@${clean}/live`, method:'GET',
          headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'}, timeout:6000 };
        const r = https.request(opts, (r2) => {
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

// ── TRANSLATION PROXY ─────────────────────────────────────
// Proxies translation requests to avoid CORS issues in browser
app.get('/api/translate', async (req, res) => {
  const { text, target = 'en' } = req.query;
  if (!text) return res.json({ ok:false });
  try {
    const encoded = encodeURIComponent(text.slice(0,500));
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=auto|${target}&de=liveannouncer@app.com`;
    const result = await new Promise((resolve) => {
      https.get(url, (r) => {
        let d=''; r.on('data',c=>d+=c);
        r.on('end',()=>{ try{resolve(JSON.parse(d));}catch(_){resolve(null);} });
      }).on('error',()=>resolve(null));
    });
    if (result?.responseData) {
      const detected = result.responseData.detectedLanguage || '';
      const translated = result.responseData.translatedText || text;
      res.json({ ok:true, translated, detected, wasTranslated: !detected.toLowerCase().startsWith('en') });
    } else {
      res.json({ ok:false, translated:text });
    }
  } catch(e) { res.json({ ok:false, translated:text }); }
});

// ══════════════════════════════════════════════════════════
// TIKTOK CONNECTOR — self-healing, version-adaptive
// ══════════════════════════════════════════════════════════
let connectorModule = null, connectorVersion = 'unknown';
try {
  connectorModule = require('tiktok-live-connector');
  try { connectorVersion = require('./node_modules/tiktok-live-connector/package.json').version; } catch(_) {}
  console.log(`✓ tiktok-live-connector v${connectorVersion}`);
} catch(e) { console.error('✗ connector:', e.message); }

function getClass() {
  if (!connectorModule) return null;
  return connectorModule.WebcastPushConnection ||
         connectorModule.default?.WebcastPushConnection ||
         (typeof connectorModule==='function' ? connectorModule : null);
}

function safeGet(obj, ...keys) {
  for (const key of keys) {
    try { const v=key.split('.').reduce((o,k)=>o?.[k],obj); if(v!=null)return v; } catch(_) {}
  }
  return null;
}

function wireEvents(conn, socket, clean) {
  const safe = fn => (...a) => { try{fn(...a);}catch(e){console.error('[evt]',e.message);} };
  conn.on('chat', safe(d => socket.emit('event',{
    type:'comment',
    username: safeGet(d,'uniqueId','userId','user.uniqueId','nickname')||'Someone',
    text: safeGet(d,'comment','content','message','')||''
  })));
  conn.on('gift', safe(d => {
    const streakable = safeGet(d,'gift.streakable','giftType');
    const streaking  = safeGet(d,'streaking','repeatEnd');
    if (streakable===1 && streaking!==true) return;
    const giftName = safeGet(d,'giftName','gift.name')||'Gift';
    const coins    = safeGet(d,'diamondCount','gift.diamondCount','coins')||0;
    socket.emit('event',{ type:'gift',
      username: safeGet(d,'uniqueId','user.uniqueId','nickname')||'Someone',
      giftName, coins, repeatCount: safeGet(d,'repeatCount')||1, emoji:'🎁'
    });
    // Auto-learn
    try {
      const body=JSON.stringify({name:giftName,coins,emoji:'🎁'});
      const opts={hostname:'localhost',port:PORT,path:'/api/gifts/learn',method:'POST',
        headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}};
      https.request(opts,()=>{}).on('error',()=>{}).end(body);
    } catch(_) {}
  }));
  conn.on('follow', safe(d => socket.emit('event',{type:'follow',username:safeGet(d,'uniqueId','user.uniqueId')||'Someone'})));
  conn.on('social', safe(d => socket.emit('event',{type:d.followEvent||d.follow?'follow':'share',username:safeGet(d,'uniqueId','user.uniqueId')||'Someone'})));
  conn.on('share',  safe(d => socket.emit('event',{type:'share',username:safeGet(d,'uniqueId','user.uniqueId')||'Someone'})));
  conn.on('subscribe',safe(d=>socket.emit('event',{type:'subscribe',username:safeGet(d,'uniqueId','user.uniqueId')||'Someone'})));
  conn.on('roomUser',safe(d=>socket.emit('event',{type:'viewer_count',count:safeGet(d,'viewerCount','totalUserCount')||0})));
  conn.on('roomStats',safe(d=>socket.emit('event',{type:'viewer_count',count:safeGet(d,'viewerCount')||0})));
  conn.on('like',safe(d=>socket.emit('event',{type:'like',username:safeGet(d,'uniqueId','user.uniqueId')||'Someone',count:safeGet(d,'likeCount','count')||1})));
  conn.on('streamEnd',safe(()=>socket.emit('tiktok-disconnected',{reason:'Stream ended.'})));
  conn.on('disconnect',safe(()=>socket.emit('tiktok-disconnected',{reason:'Disconnected.'})));
  conn.on('error',safe(e=>{ const m=e?.message||String(e); console.error('[err]',m); socket.emit('tiktok-error',{message:m}); }));
}

function friendlyError(msg) {
  if (!msg) return 'Connection failed. Please try again.';
  const m = msg.toLowerCase();
  if (m.includes('sessionid')||m.includes('websocket')||m.includes('upgrade')||m.includes('sign')) return 'SESSION_ID_NEEDED';
  if (m.includes('cannot read')||m.includes('undefined')||m.includes('status')||m.includes('null')) return 'Connection failed. Make sure the stream is live and your Session ID is fresh — log out of TikTok and back in to get a new one.';
  if (m.includes('live')||m.includes('not started')||m.includes('room')) return 'Stream not found or not live. Make sure the stream is already live before connecting.';
  if (m.includes('not found')||m.includes('404')||m.includes('user')) return 'Username not found on TikTok. Check the spelling and try again.';
  if (m.includes('timeout')) return 'Connection timed out. Please try again.';
  if (m.includes('429')||m.includes('rate')) return 'Too many requests. Wait a moment and try again.';
  return `Connection error: ${msg.slice(0,100)}`;
}

const sessions = new Map();
io.on('connection', socket => {
  console.log(`[+] ${socket.id}`);
  socket.on('connect-tiktok', async ({ username, sessionId }) => {
    const clean = (username||'').replace('@','').trim();
    if (!clean) return socket.emit('tiktok-error',{message:'Please enter a TikTok username.'});
    if (sessions.has(socket.id)) { try{sessions.get(socket.id).disconnect();}catch(_){} sessions.delete(socket.id); }
    const C = getClass();
    if (!C) return socket.emit('tiktok-error',{message:'TikTok connector not loaded on server.'});
    socket.emit('tiktok-connecting',{username:clean});
    console.log(`[→] @${clean} v${connectorVersion} session=${sessionId?'yes':'no'}`);
    const attempts = [
      { processInitialData:false, requestPollingIntervalMs:2000, clientParams:{app_language:'en-US',device_platform:'web'},
        ...(sessionId?.trim().length>10 ? {sessionId:sessionId.trim(),enableWebsocketUpgrade:false} : {enableWebsocketUpgrade:true}) },
      { processInitialData:false, ...(sessionId?.trim().length>10 ? {sessionId:sessionId.trim()} : {enableWebsocketUpgrade:true}) },
      {}
    ];
    let lastErr = null;
    for (let i=0; i<attempts.length; i++) {
      try {
        console.log(`[→] attempt ${i+1}`);
        const conn = new C(clean, attempts[i]);
        wireEvents(conn, socket, clean);
        const state = await conn.connect();
        sessions.set(socket.id, conn);
        console.log(`[✓] @${clean} connected attempt ${i+1}`);
        socket.emit('tiktok-connected',{username:clean,roomId:safeGet(state,'roomId','room_id','')||''});
        return;
      } catch(err) {
        lastErr = err;
        const m = err?.message||String(err);
        console.warn(`[~] attempt ${i+1} failed: ${m.slice(0,80)}`);
        if (m.includes('not found')||m.includes('404')) break;
        if (i<attempts.length-1) await new Promise(r=>setTimeout(r,600));
      }
    }
    sessions.delete(socket.id);
    socket.emit('tiktok-error',{message:friendlyError(lastErr?.message||String(lastErr))});
  });
  socket.on('disconnect-tiktok',()=>{
    if(sessions.has(socket.id)){try{sessions.get(socket.id).disconnect();}catch(_){}sessions.delete(socket.id);}
    socket.emit('tiktok-disconnected',{reason:'Disconnected manually.'});
  });
  socket.on('disconnect',()=>{
    if(sessions.has(socket.id)){try{sessions.get(socket.id).disconnect();}catch(_){}sessions.delete(socket.id);}
    console.log(`[-] ${socket.id}`);
  });
});

// Keep alive
if (process.env.PROJECT_DOMAIN) {
  // Glitch keep-alive
  setInterval(()=>{
    https.get(`https://${process.env.PROJECT_DOMAIN}.glitch.me/ping`).on('error',()=>{});
  }, 4*60*1000);
} else if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(()=>{https.get(`${process.env.RENDER_EXTERNAL_URL}/ping`).on('error',()=>{});},14*60*1000);
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`\n🎙 LiveAnnouncer — port ${PORT}\n`));
