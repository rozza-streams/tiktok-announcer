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

// ── TIKTOK CONNECTOR ──────────────────────────────────────
let WebcastPushConnection = null;
try { ({WebcastPushConnection}=require('tiktok-live-connector')); console.log('✓ connector ready'); }
catch(e) { console.error('✗ connector:',e.message); }

const sessions = new Map();
io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('connect-tiktok', async ({username,sessionId}) => {
    const clean = (username||'').replace('@','').trim();
    if(!clean) return socket.emit('tiktok-error',{message:'Please enter a valid TikTok username.'});
    if(sessions.has(socket.id)){try{sessions.get(socket.id).disconnect();}catch(_){}sessions.delete(socket.id);}
    if(!WebcastPushConnection) return socket.emit('tiktok-error',{message:'TikTok connector not available.'});
    socket.emit('tiktok-connecting',{username:clean});
    try {
      const opts = {processInitialData:false,requestPollingIntervalMs:2000,clientParams:{app_language:'en-US',device_platform:'web'}};
      if(sessionId&&sessionId.trim().length>10){opts.sessionId=sessionId.trim();opts.enableWebsocketUpgrade=false;}
      else opts.enableWebsocketUpgrade=true;
      const conn = new WebcastPushConnection(clean,opts);
      sessions.set(socket.id,conn);
      conn.on('chat',d=>socket.emit('event',{type:'comment',username:d.uniqueId||d.nickname||'Someone',text:d.comment||''}));
      conn.on('gift',d=>{
        if(d.giftType===1&&!d.repeatEnd)return;
        const evt={type:'gift',username:d.uniqueId||d.nickname||'Someone',giftName:d.giftName||'Gift',coins:d.diamondCount||0,repeatCount:d.repeatCount||1,emoji:'🎁',giftId:d.giftId||''};
        socket.emit('event',evt);
        // Auto-learn gift
        if(d.giftName&&d.diamondCount!=null){
          fetch(`http://localhost:${PORT}/api/gifts/learn`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:d.giftName,coins:d.diamondCount,emoji:'🎁',giftId:String(d.giftId||d.giftName)})}).catch(()=>{});
        }
      });
      conn.on('follow',d=>socket.emit('event',{type:'follow',username:d.uniqueId||d.nickname||'Someone'}));
      conn.on('share',d=>socket.emit('event',{type:'share',username:d.uniqueId||d.nickname||'Someone'}));
      conn.on('subscribe',d=>socket.emit('event',{type:'subscribe',username:d.uniqueId||d.nickname||'Someone'}));
      conn.on('roomUser',d=>socket.emit('event',{type:'viewer_count',count:d.viewerCount||0}));
      conn.on('like',d=>socket.emit('event',{type:'like',username:d.uniqueId||'Someone',count:d.likeCount||0}));
      conn.on('streamEnd',()=>{socket.emit('tiktok-disconnected',{reason:'Stream ended.'});sessions.delete(socket.id);});
      conn.on('disconnect',()=>{socket.emit('tiktok-disconnected',{reason:'Disconnected.'});sessions.delete(socket.id);});
      conn.on('error',e=>{const m=e?.message||String(e);console.error('[!]',m);socket.emit('tiktok-error',{message:m});});
      const state=await conn.connect();
      console.log(`[✓] @${clean} room:${state?.roomId}`);
      socket.emit('tiktok-connected',{username:clean,roomId:state?.roomId||''});
    } catch(err) {
      sessions.delete(socket.id);
      const msg=err?.message||String(err);
      let friendly=msg;
      if(msg.includes('sessionId')||msg.includes('websocket'))friendly='SESSION_ID_NEEDED';
      else if(msg.includes('LIVE')||msg.includes('not started'))friendly='Stream not found or not live.';
      else if(msg.includes('not found')||msg.includes('404'))friendly='Username not found on TikTok.';
      socket.emit('tiktok-error',{message:friendly});
    }
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

if(process.env.RENDER_EXTERNAL_URL){
  setInterval(()=>{https.get(`${process.env.RENDER_EXTERNAL_URL}/ping`).on('error',()=>{});},14*60*1000);
}

const PORT = process.env.PORT||3000;
httpServer.listen(PORT,()=>console.log(`\n🎙 TikTok Live Announcer — port ${PORT}\n`));
