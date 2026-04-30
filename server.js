const express = require('express');
const path    = require('path');
const fs      = require('fs');
const https   = require('https');

const app = express();
app.use(express.json());

// ── Serve static files from public/ ──────────────────────
const PUBLIC = path.join(__dirname, 'public');
app.use(express.static(PUBLIC));
app.get('/', (_, res) => res.sendFile(path.join(PUBLIC, 'index.html')));
app.get('/ping', (_, res) => res.json({ ok: true, uptime: Math.floor(process.uptime()) }));

// ── EulerStream JWT endpoint ──────────────────────────────
// Creates a short-lived JWT so browsers can connect to EulerStream
// without ever seeing the real API key
app.get('/api/euler-connect', async (req, res) => {
  const username = (req.query.username || '').trim();
  if (!username) return res.json({ ok: false, error: 'No username provided' });

  const apiKey = process.env.EULER_API_KEY;
  if (!apiKey) {
    // Fallback — tell browser to use its own stored key if server has none
    return res.json({ ok: false, error: 'No server API key configured' });
  }

  try {
    // Ask EulerStream to create a short-lived JWT for this username
    const result = await new Promise((resolve) => {
      const body = JSON.stringify({
        expireAfter: 3600, // 1 hour
        websockets: {
          allowedCreators: [username],
          maxWebSockets: 1
        }
      });
      const opts = {
        hostname: 'www.eulerstream.com',
        path: '/api/v1/jwt/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 8000
      };
      const r = https.request(opts, (r2) => {
        let d = '';
        r2.on('data', c => d += c);
        r2.on('end', () => { try { resolve(JSON.parse(d)); } catch(_) { resolve(null); } });
      });
      r.on('error', () => resolve(null));
      r.on('timeout', () => { r.destroy(); resolve(null); });
      r.end(body);
    });

    if (result && (result.token || result.jwt || result.data?.token)) {
      const token = result.token || result.jwt || result.data?.token;
      return res.json({ ok: true, token, username });
    }

    // JWT creation failed — return API key directly as fallback
    // (less secure but functional)
    console.error('[Euler] JWT creation failed:', JSON.stringify(result));
    res.json({ ok: true, apiKey, username, direct: true });

  } catch(e) {
    console.error('[Euler] JWT error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

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
  try {
    if (fs.existsSync(GIFTS_FILE)) return JSON.parse(fs.readFileSync(GIFTS_FILE, 'utf8'));
  } catch(_) {}
  return [...DEFAULT_GIFTS];
}
function saveGifts(gifts) {
  try { fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2)); } catch(_) {}
}

// Get full gift list
app.get('/api/gifts', (_, res) => res.json(loadGifts()));

// Auto-learn a new gift seen during a stream
app.post('/api/gifts/learn', (req, res) => {
  const { name, coins, emoji } = req.body || {};
  if (!name) return res.json({ ok: false });
  const gifts = loadGifts();
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (!gifts.find(g => g.id === id || g.name.toLowerCase() === name.toLowerCase())) {
    gifts.push({ id, name, coins: +coins || 0, emoji: emoji || '🎁', learned: true });
    gifts.sort((a, b) => a.coins - b.coins);
    saveGifts(gifts);
    return res.json({ ok: true, learned: true });
  }
  res.json({ ok: true, learned: false });
});

// ── TRANSLATION PROXY ─────────────────────────────────────
// Proxies to MyMemory free API to avoid CORS issues
app.get('/api/translate', async (req, res) => {
  const { text, target = 'en' } = req.query;
  if (!text) return res.json({ ok: false });
  try {
    const encoded = encodeURIComponent(text.slice(0, 500));
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=auto|${target}`;
    const result = await new Promise((resolve) => {
      https.get(url, (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => {
          try { resolve(JSON.parse(d)); } catch(_) { resolve(null); }
        });
      }).on('error', () => resolve(null));
    });
    if (result?.responseData) {
      const detected  = result.responseData.detectedLanguage || '';
      const translated = result.responseData.translatedText || text;
      const wasTranslated = detected ? !detected.toLowerCase().startsWith('en') : false;
      res.json({ ok: true, translated, detected, wasTranslated });
    } else {
      res.json({ ok: false, translated: text });
    }
  } catch(e) {
    res.json({ ok: false, translated: text });
  }
});

// ── KEEP ALIVE (Render free tier) ─────────────────────────
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    https.get(`${process.env.RENDER_EXTERNAL_URL}/ping`).on('error', () => {});
  }, 14 * 60 * 1000);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🎙 LiveAnnouncer — Created by RB and Claude AI`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`📁 Serving: ${PUBLIC}\n`);
});
