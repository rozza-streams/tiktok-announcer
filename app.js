'use strict';

const socket = io();

// ── CONSTANTS ─────────────────────────────────────────────────
const FAKE_USERS = ['StarGazer99','MikeyMike','LunaLove','TechWizard','SarahSunshine',
  'DarkKnight88','PinkPanda','GameOn2024','CoolCat777','VibeCheck','NightOwl',
  'FlipFlop','MoonChild','ElectricDave','CherryBlossom','TigerKing2','BlueSky22',
  'GeminiRose','SilverFox','NeonLights'];

const FAKE_GIFTS = [
  {n:'Rose',c:1,e:'🌹'},{n:'TikTok',c:5,e:'🎵'},{n:'Sunglasses',c:5,e:'🕶'},
  {n:'Soccer',c:10,e:'⚽'},{n:'Ice Cream',c:20,e:'🍦'},{n:'Crown',c:50,e:'👑'},
  {n:'Rocket',c:100,e:'🚀'},{n:'Diamond',c:200,e:'💎'},{n:'Dragon',c:500,e:'🐉'},
  {n:'Lion',c:1000,e:'🦁'},{n:'Universe',c:5000,e:'🌌'},{n:'Galaxy',c:10000,e:'🌠'}
];

const FAKE_COMMENTS = [
  'love your stream!','hello there!','first time here!','this is amazing',
  'you are so talented','keep it up!','you are the best',
  'what headset do you use?','how long have you been streaming?',
  'love the energy today','giving you a follow now','so entertaining tonight',
  'you make my day every stream','can you do a shoutout please?',
  'love from the UK','never miss a stream'
];

const TOXIC_WORDS = ['hate','stupid','idiot','ugly','kill yourself','die','loser','moron'];
const PROFANITY   = ['damn','crap','hell','bloody'];

// ══════════════════════════════════════════════════════════════
// SOUND LIBRARY — built-in sounds using Web Audio API
// Each sound is [freq, startSec, endSec, waveType, gain]
// Gain values are HIGH for loud output
// ══════════════════════════════════════════════════════════════
const SOUNDS = {
  // ── COINS & CHIMES ──
  'Coin Chime':       [[523,0,.12,'sine',.6],[659,.1,.22,'sine',.5]],
  'Double Ding':      [[880,0,.06,'sine',.7],[880,.08,.18,'sine',.5],[1047,.15,.28,'sine',.5]],
  'Bell Tower':       [[440,0,.08,'sine',.8],[554,.07,.18,'sine',.6],[659,.15,.3,'sine',.5]],
  'Cash Register':    [[1047,0,.05,'square',.25],[784,.04,.1,'sine',.6],[1047,.09,.18,'sine',.7],[1568,.16,.28,'sine',.6]],
  'Triple Coin':      [[523,0,.07,'sine',.6],[523,.08,.15,'sine',.6],[523,.16,.25,'sine',.7]],
  // ── POPS & CLICKS ──
  'Pop':              [[400,0,.06,'sine',.8],[250,.04,.1,'sine',.5]],
  'Double Pop':       [[400,0,.05,'sine',.7],[250,.04,.09,'sine',.5],[400,.1,.15,'sine',.7],[250,.14,.19,'sine',.5]],
  'Bubble Pop':       [[300,0,.08,'sine',.6],[200,.05,.14,'sine',.5]],
  // ── SPARKLES & MAGIC ──
  'Sparkle':          [[1046,0,.07,'sine',.6],[1318,.06,.13,'sine',.6],[1568,.12,.2,'sine',.5],[2093,.18,.28,'sine',.4]],
  'Magic Twinkle':    [[1046,0,.06,'sine',.5],[1318,.05,.11,'sine',.5],[1568,.1,.16,'sine',.5],[1318,.15,.22,'sine',.45],[1046,.2,.3,'sine',.45]],
  'Fairy Dust':       [[2093,0,.05,'sine',.4],[1760,.04,.1,'sine',.4],[1568,.08,.15,'sine',.4],[1318,.12,.2,'sine',.4],[1047,.18,.28,'sine',.5]],
  // ── POWER & GAME ──
  'Power Up':         [[261,0,.07,'square',.3],[330,.06,.13,'square',.3],[392,.12,.19,'square',.3],[523,.18,.28,'square',.35]],
  'Level Up':         [[523,0,.1,'sine',.5],[659,.09,.18,'sine',.55],[784,.17,.26,'sine',.55],[1047,.24,.38,'sine',.6]],
  'Retro Game':       [[523,0,.06,'square',.35],[659,.05,.11,'square',.35],[784,.1,.16,'square',.35],[1047,.15,.24,'square',.4]],
  'Game Start':       [[392,0,.08,'square',.3],[523,.07,.14,'square',.35],[659,.13,.2,'square',.35],[784,.19,.3,'square',.4]],
  'Boss Fight':       [[110,0,.1,'square',.4],[138,.09,.19,'square',.4],[110,.18,.28,'square',.4],[165,.27,.4,'square',.45]],
  // ── FANFARES ──
  'Trumpet Fanfare':  [[523,0,.12,'triangle',.5],[659,.1,.22,'triangle',.55],[784,.2,.32,'triangle',.55],[1047,.3,.48,'triangle',.65]],
  'Royal Fanfare':    [[261,0,.12,'square',.3],[392,0,.18,'sine',.55],[523,.1,.22,'sine',.65],[659,.19,.3,'sine',.65],[784,.28,.42,'sine',.6],[1047,.38,.58,'sine',.7]],
  'Victory Jingle':   [[784,0,.1,'sine',.5],[988,.09,.18,'sine',.55],[1175,.17,.26,'sine',.55],[988,.25,.34,'sine',.5],[1175,.32,.5,'sine',.65]],
  'Grand Fanfare':    [[262,0,.1,'square',.25],[330,.05,.15,'square',.3],[392,.1,.2,'square',.35],[523,.15,.25,'square',.4],[659,.22,.32,'triangle',.5],[784,.3,.42,'triangle',.55],[1047,.38,.6,'triangle',.65]],
  // ── ALERTS ──
  'Alert Beep':       [[880,0,.14,'square',.5],[880,.18,.32,'square',.5]],
  'Double Alert':     [[1047,0,.1,'square',.5],[1047,.12,.22,'square',.5],[1047,.24,.36,'square',.6]],
  'Warning Siren':    [[440,0,.25,'sawtooth',.3],[554,.2,.45,'sawtooth',.3],[440,.4,.65,'sawtooth',.3]],
  'Ping':             [[1318,0,.04,'sine',.8],[1318,.04,.2,'sine',.4]],
  // ── BASS & IMPACT ──
  'Big Boom':         [[55,0,.06,'square',.55],[80,.04,.14,'square',.5],[110,.1,.28,'sawtooth',.4],[80,.24,.4,'square',.35]],
  'Explosion':        [[80,0,.08,'square',.5],[60,.06,.2,'square',.5],[100,.16,.35,'sawtooth',.35]],
  'Bass Drop':        [[80,0,.05,'square',.5],[60,.04,.2,'square',.6],[40,.18,.45,'square',.5]],
  'Thunder':          [[60,0,.05,'sawtooth',.45],[45,.04,.15,'sawtooth',.5],[55,.13,.35,'square',.4],[35,.3,.6,'sawtooth',.3]],
  // ── HEARTS & SOFT ──
  'Hearts':           [[523,0,.1,'sine',.5],[659,.09,.2,'sine',.55],[523,.19,.3,'sine',.45]],
  'Gentle Ping':      [[659,0,.14,'sine',.55],[784,.12,.26,'sine',.5]],
  'Soft Chime':       [[784,0,.15,'sine',.4],[988,.13,.28,'sine',.38],[784,.26,.4,'sine',.35]],
  // ── WHOOSH ──
  'Whoosh Up':        [[200,0,.18,'sawtooth',.3],[800,.1,.25,'sawtooth',.25]],
  'Swoosh':           [[600,0,.2,'sawtooth',.25],[150,.15,.32,'sawtooth',.2]],
  // ── FUN ──
  'Airhorn':          [[233,0,.04,'square',.4],[185,.03,.25,'square',.5],[233,.24,.4,'square',.4]],
  'Laser':            [[1200,0,.15,'sawtooth',.3],[400,.08,.22,'sawtooth',.3]],
  'Xylophone':        [[880,0,.1,'sine',.55],[1047,.09,.19,'sine',.55],[1318,.18,.3,'sine',.5],[1047,.28,.38,'sine',.5]],
  'Drumroll Hit':     [[150,0,.04,'square',.5],[180,.03,.08,'square',.5],[150,.07,.12,'square',.5],[200,.11,.22,'square',.6]],
  'Notification':     [[880,0,.06,'sine',.6],[1047,.05,.12,'sine',.6]],
  'Tada':             [[523,0,.08,'sine',.5],[659,.06,.14,'sine',.55],[784,.12,.2,'sine',.6],[1047,.18,.35,'sine',.65]],
  'Cheer':            [[400,0,.05,'sawtooth',.25],[500,.04,.1,'sawtooth',.25],[600,.09,.18,'sawtooth',.3],[700,.16,.3,'sawtooth',.25]],
  'None':             []
};

const SOUND_NAMES = Object.keys(SOUNDS);

// ── STATE ─────────────────────────────────────────────────────
const S = {
  isLive:false, isMuted:false, tiktokConnected:false,
  startTime:null, streamDuration:0, streamInterval:null,
  viewers:0, peakViewers:0,
  followsTonight:0, coinsTonight:0, giftsTonight:0,
  commentsTonight:0, likesTonight:0,
  topGifter:'', topGifterCoins:0,
  topCommenter:'', topCommenterCount:0,
  giftGoal:1000, giftGoalProgress:0, goalMilestonesHit:[],
  qaMode:false, safeMode:false, calmMode:false,
  toxicFilter:true, bleepProfanity:false, vcEnabled:false,
  announceLikes:false,
  speechRate:1.0, voiceVolume:1.0, sfxVolume:1.0,
  selectedVoice:null,
  queue:[], isAnnouncing:false, lastText:'', lastType:'system',
  spamTracker:{}, viewerHistory:{},
  giftStreaks:{}, giftStreakTimers:{},
  giftCounts:{}, commentCounts:{},
  viewerMilestones:new Set(), followMilestones:new Set(),
  activitySpike:[], silenceTimer:null,
  firstCommentDone:false,
  pollActive:false, pollResults:{yes:0,no:0}, pollTimer:null,
  fttActive:false, fttWord:'',
  giveawayActive:false, giveawayEntrants:new Set(),
  countdownTimer:null,
  audioCtx:null,
  reminderIntervals:[]
};

// ══════════════════════════════════════════════════════════════
// AUDIO ENGINE
// ══════════════════════════════════════════════════════════════
const Audio = {
  init() {
    if (!S.audioCtx) S.audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if (S.audioCtx.state === 'suspended') S.audioCtx.resume();
  },

  // Play a built-in preset by name
  play(name) {
    if (!name || name === 'None') return;
    const preset = SOUNDS[name];
    if (preset) { this.playPreset(preset); return; }
    // If not a preset name, treat as URL
    this.playUrl(name);
  },

  playPreset(preset) {
    if (!preset || !preset.length) return;
    try {
      this.init();
      const ctx = S.audioCtx;
      const master = ctx.createGain();
      // HIGH base gain — loud by default
      master.gain.setValueAtTime(S.sfxVolume, ctx.currentTime);
      master.connect(ctx.destination);
      preset.forEach(([freq, start, end, wave, g]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(master);
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(g, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + end);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + end + 0.01);
      });
    } catch(_) {}
  },

  // Play an audio file from a URL
  playUrl(url) {
    if (!url || url === 'None') return;
    try {
      this.init();
      const ctx = S.audioCtx;
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(buf => ctx.decodeAudioData(buf))
        .then(decoded => {
          const src = ctx.createBufferSource();
          const gain = ctx.createGain();
          src.buffer = decoded;
          gain.gain.setValueAtTime(S.sfxVolume, ctx.currentTime);
          src.connect(gain); gain.connect(ctx.destination);
          src.start();
        })
        .catch(() => {
          // If URL fails, fall back to a simple beep
          this.play('Notification');
        });
    } catch(_) {}
  },

  // Resolve and play a SoundManager event sound
  event(eventKey) {
    const sound = SoundManager.get(eventKey);
    if (sound) this.play(sound);
  }
};

// ══════════════════════════════════════════════════════════════
// GIFT LIBRARY — full TikTok gift list with per-gift sounds
// ══════════════════════════════════════════════════════════════
const GiftLibrary = {
  gifts: [],       // [{id, name, coins, emoji}, ...]
  sounds: {},      // {gift_id: soundName}
  filterText: '',

  async load() {
    // Load gift sounds config
    try { this.sounds = JSON.parse(localStorage.getItem('tla-gift-sounds') || '{}'); } catch(_) {}
    // Fetch gift list from server
    try {
      const res = await fetch('/api/gifts');
      this.gifts = await res.json();
    } catch(_) {
      this.gifts = [];
    }
    this.render();
  },

  save() {
    localStorage.setItem('tla-gift-sounds', JSON.stringify(this.sounds));
  },

  getSound(giftId, giftName) {
    // Check by id first, then by name
    const id = (giftId || giftName || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
    return this.sounds[id] || this.sounds[giftName?.toLowerCase()] || null;
  },

  setSound(giftId, soundName) {
    this.sounds[giftId] = soundName;
    this.save();
  },

  filter(text) {
    this.filterText = text.toLowerCase();
    this.render();
  },

  async refresh() {
    const btn = el('gift-refresh-btn');
    btn.textContent = '⏳ Refreshing...';
    btn.disabled = true;
    try {
      const res = await fetch('/api/gifts/refresh');
      const data = await res.json();
      if (data.ok) {
        // Reload the gift list
        const r2 = await fetch('/api/gifts');
        this.gifts = await r2.json();
        this.render();
        Queue.add(`Gift list updated. ${data.added ? data.added + ' new gifts added.' : 'All gifts up to date.'} Total: ${this.gifts.length} gifts.`, 'system', 3);
      } else {
        Queue.add('Could not refresh from TikTok right now. Using existing list.', 'system', 5);
      }
    } catch(_) {
      Queue.add('Refresh failed. Using existing gift list.', 'system', 5);
    }
    btn.textContent = '🔄 Refresh';
    btn.disabled = false;
  },

  // Called when a new gift arrives that wasn't in the list
  async learnGift(giftName, coins, emoji) {
    try {
      const res = await fetch('/api/gifts/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: giftName, coins, emoji })
      });
      const data = await res.json();
      if (data.learned) {
        // Add to local list
        const id = giftName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        this.gifts.push({ id, name: giftName, coins, emoji: emoji || '🎁', learned: true });
        this.gifts.sort((a, b) => a.coins - b.coins);
        this.render();
        UI.log('system', 'Gifts', `New gift learned: ${giftName} (${coins} coins)`, '🆕');
      }
    } catch(_) {}
  },

  render() {
    const container = el('gift-lib-grid');
    if (!container) return;
    const filtered = this.filterText
      ? this.gifts.filter(g => g.name.toLowerCase().includes(this.filterText))
      : this.gifts;

    if (!filtered.length) {
      container.innerHTML = `<div style="color:var(--text3);font-size:.9rem;padding:1rem">No gifts found.</div>`;
      return;
    }

    const soundOptions = SOUND_NAMES.map(n => `<option value="${n}">${n}</option>`).join('');

    container.innerHTML = filtered.map(g => {
      const current = this.sounds[g.id] || 'None';
      return `
        <div class="gift-card" data-id="${g.id}">
          <div class="gift-card-emoji">${g.emoji}</div>
          <div class="gift-card-info">
            <div class="gift-card-name">${g.name}${g.learned ? ' <span class="gift-new-badge">NEW</span>' : ''}</div>
            <div class="gift-card-coins">🪙 ${g.coins.toLocaleString()}</div>
          </div>
          <div class="gift-card-controls">
            <select class="gift-sound-sel" onchange="GiftLibrary.setSound('${g.id}',this.value)" aria-label="Sound for ${g.name}">
              ${SOUND_NAMES.map(n => `<option value="${n}" ${n===current?'selected':''}>${n}</option>`).join('')}
            </select>
            <button class="gift-test-btn" onclick="Audio.play(GiftLibrary.sounds['${g.id}']||'None')" aria-label="Test sound for ${g.name}">▶</button>
          </div>
        </div>`;
    }).join('');
  }
};

// ══════════════════════════════════════════════════════════════
// SOUND MANAGER — per-event sound config
// ══════════════════════════════════════════════════════════════
const SoundManager = {
  // Default sounds per event
  defaults: {
    'small':     'Coin Chime',
    'medium':    'Sparkle',
    'large':     'Royal Fanfare',
    'follow':    'Bell Tower',
    'like':      'Hearts',
    'share':     'Notification',
    'comment':   'Pop',
    'milestone': 'Trumpet Fanfare'
  },
  config: {}, // event key -> sound name or URL
  customGifts: {}, // gift name -> sound name or URL

  load() {
    try {
      const d = JSON.parse(localStorage.getItem('tla-sounds-v2') || '{}');
      this.config      = d.config      || {};
      this.customGifts = d.customGifts || {};
    } catch(_) {}
    this.buildAllPickers();
    this.renderGiftCustomList();
  },

  save() {
    localStorage.setItem('tla-sounds-v2', JSON.stringify({
      config:      this.config,
      customGifts: this.customGifts
    }));
  },

  get(eventKey) {
    return this.config[eventKey] || this.defaults[eventKey] || null;
  },

  getForGift(giftName, size) {
    const key = (giftName||'').toLowerCase();
    if (this.customGifts[key]) return this.customGifts[key];
    return this.get(size);
  },

  set(eventKey, value) {
    this.config[eventKey] = value;
    this.save();
  },

  addGiftCustom() {
    // No longer used — gift sounds now managed by GiftLibrary
  },

  removeGiftCustom(name) {
    delete this.customGifts[name];
    this.save();
  },

  renderGiftCustomList() {
    // No longer used — handled by GiftLibrary
  },

  // Build a sound picker widget for a given event slot
  buildPicker(containerId, eventKey, label) {
    const container = el(containerId);
    if (!container) return;
    const current = this.config[eventKey] || this.defaults[eventKey] || 'None';

    // Determine current mode
    let mode = 'library';
    if (current && !SOUNDS[current] && current !== 'None') mode = 'url';

    container.innerHTML = `
      <div class="sound-picker-row">
        <div class="sound-type-tabs">
          <button class="stab ${mode==='library'?'active':''}" onclick="SoundManager.switchTab('${eventKey}','library')">Library</button>
          <button class="stab ${mode==='url'?'active':''}" onclick="SoundManager.switchTab('${eventKey}','url')">URL / Link</button>
        </div>
        <div class="sound-select-row ${mode==='url'?'hidden':''}" id="lib-row-${eventKey}">
          <select class="sselect" id="lib-sel-${eventKey}" onchange="SoundManager.onLibChange('${eventKey}')">
            ${SOUND_NAMES.map(n=>`<option value="${n}" ${n===current?'selected':''}>${n}</option>`).join('')}
          </select>
          <button class="test-snd" onclick="SoundManager.testEvent('${eventKey}')">▶ Test</button>
        </div>
        <div class="sound-url-row ${mode!=='url'?'hidden':''}" id="url-row-${eventKey}">
          <input type="text" class="sound-url-in" id="url-in-${eventKey}"
            placeholder="Paste any MP3/WAV URL e.g. from Freesound or Zapsplat"
            value="${mode==='url'?current:''}"
            onchange="SoundManager.onUrlChange('${eventKey}')">
          <button class="test-snd" onclick="SoundManager.testEvent('${eventKey}')">▶ Test</button>
        </div>
      </div>`;
  },

  buildAllPickers() {
    this.buildPicker('se-small',    'small',    'Small Gift');
    this.buildPicker('se-medium',   'medium',   'Medium Gift');
    this.buildPicker('se-large',    'large',    'Large Gift');
    this.buildPicker('se-follow',   'follow',   'Follow');
    this.buildPicker('se-like',     'like',     'Like');
    this.buildPicker('se-share',    'share',    'Share');
    this.buildPicker('se-comment',  'comment',  'Comment');
    this.buildPicker('se-milestone','milestone','Milestone');
  },

  switchTab(eventKey, mode) {
    const libRow = el(`lib-row-${eventKey}`);
    const urlRow = el(`url-row-${eventKey}`);
    const tabs = document.querySelectorAll(`#se-${eventKey} .stab, #se-small .stab, #se-medium .stab, #se-large .stab, #se-follow .stab, #se-like .stab, #se-share .stab, #se-comment .stab, #se-milestone .stab`);
    // Just toggle the right container
    if (!libRow || !urlRow) return;
    const container = libRow.closest('.sound-picker-row');
    container.querySelectorAll('.stab').forEach((t,i) => {
      t.classList.toggle('active', (i===0 && mode==='library') || (i===1 && mode==='url'));
    });
    libRow.classList.toggle('hidden', mode !== 'library');
    urlRow.classList.toggle('hidden', mode !== 'url');
  },

  onLibChange(eventKey) {
    const val = el(`lib-sel-${eventKey}`)?.value;
    if (val) this.set(eventKey, val);
  },

  onUrlChange(eventKey) {
    const val = el(`url-in-${eventKey}`)?.value?.trim();
    if (val) this.set(eventKey, val);
  },

  testEvent(eventKey) {
    const sound = this.config[eventKey] || this.defaults[eventKey];
    Audio.play(sound);
  }
};

// ══════════════════════════════════════════════════════════════
// VOICE PICKER — shows ALL available voices, English first
// ══════════════════════════════════════════════════════════════
const VoicePicker = {
  voices: [],
  load() {
    const all = speechSynthesis.getVoices();
    if (!all.length) return;
    // Sort: English first, then by language
    this.voices = all.sort((a, b) => {
      const aEn = a.lang.startsWith('en') ? 0 : 1;
      const bEn = b.lang.startsWith('en') ? 0 : 1;
      if (aEn !== bEn) return aEn - bEn;
      return a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
    });
    const sel = el('voice-select');
    if (!sel) return;
    const saved = localStorage.getItem('tla-voice');
    sel.innerHTML = this.voices.map((v, i) => {
      const star = v.localService ? ' ★' : '';
      return `<option value="${i}" ${saved===v.name?'selected':''}>${v.name} — ${v.lang}${star}</option>`;
    }).join('');
    const savedIdx = this.voices.findIndex(v => v.name === saved);
    if (savedIdx >= 0) { sel.value = savedIdx; S.selectedVoice = this.voices[savedIdx]; }
    else if (this.voices.length) S.selectedVoice = this.voices[0];
  },
  preview() {
    const sel = el('voice-select');
    if (!sel) return;
    const voice = this.voices[+sel.value];
    if (!voice) return;
    S.selectedVoice = voice;
    localStorage.setItem('tla-voice', voice.name);
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance('Hi! This is how announcements will sound on your stream. Welcome everyone to the live!');
    utt.voice = voice; utt.rate = S.speechRate; utt.volume = 1.0;
    speechSynthesis.speak(utt);
  }
};

// ══════════════════════════════════════════════════════════════
// SPEECH ENGINE
// ══════════════════════════════════════════════════════════════
const Speech = {
  speak(text, opts = {}) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate   = opts.rate   !== undefined ? opts.rate   : S.speechRate;
    u.pitch  = opts.pitch  !== undefined ? opts.pitch  : 1.0;
    // HIGH volume — 1.0 is max for Web Speech API
    u.volume = opts.volume !== undefined ? opts.volume : Math.min(1.0, S.voiceVolume);
    if (S.selectedVoice) u.voice = S.selectedVoice;
    else {
      const en = speechSynthesis.getVoices().filter(v => v.lang && v.lang.startsWith('en'));
      if (en.length) u.voice = en[0];
    }
    if (opts.onend) u.onend = opts.onend;
    u.onerror = () => { if (opts.onend) opts.onend(); };
    speechSynthesis.speak(u);
  },
  cancel() { speechSynthesis.cancel(); }
};

// ══════════════════════════════════════════════════════════════
// QUEUE ENGINE
// ══════════════════════════════════════════════════════════════
const Queue = {
  add(text, type = 'system', priority = 5, sound = null, opts = {}) {
    if (S.isMuted && priority > 1) return;
    if (S.calmMode && priority > 3 && S.queue.some(i => i.type === type)) return;
    const item = { text, type, priority, sound, opts, id: Date.now() + Math.random() };
    let idx = S.queue.findIndex(i => i.priority > priority);
    if (idx === -1) S.queue.push(item);
    else            S.queue.splice(idx, 0, item);
    if (S.calmMode && S.queue.length > 6) S.queue = S.queue.slice(0, 6);
    UI.updateQueue();
    if (!S.isAnnouncing) this.next();
  },
  next() {
    if (!S.queue.length) { S.isAnnouncing = false; UI.clearNP(); return; }
    if (S.isMuted) { S.queue = []; UI.updateQueue(); UI.clearNP(); return; }
    S.isAnnouncing = true;
    const item = S.queue.shift();
    UI.updateQueue();
    UI.setNP(item);
    S.lastText = item.text; S.lastType = item.type;
    if (item.sound) {
      Audio.play(item.sound);
      setTimeout(() => this._speak(item), 350);
    } else {
      this._speak(item);
    }
  },
  _speak(item) {
    const o = Object.assign({ rate: S.speechRate, volume: S.voiceVolume }, item.opts);
    o.onend = () => { S.isAnnouncing = false; setTimeout(() => this.next(), 120); };
    Speech.speak(item.text, o);
  },
  clear() { S.queue = []; Speech.cancel(); S.isAnnouncing = false; UI.updateQueue(); UI.clearNP(); }
};

// ══════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════
const Settings = {
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('tla-v4') || '{}');
      if (d.name)        el('set-name').value = d.name;
      if (d.wakeWord)    el('set-wakeword').value = d.wakeWord;
      if (d.water)       el('set-water').value = d.water;
      if (d.followNudge) el('set-follow-nudge').value = d.followNudge;
      if (d.socials)     el('set-socials').value = d.socials;
      if (d.posture)     el('set-posture').value = d.posture;
      if (d.viewerT)     el('set-viewers-timer').value = d.viewerT;
      if (d.earnings)    el('set-earnings').value = d.earnings;
      if (d.goal)        { el('set-goal').value = d.goal; S.giftGoal = +d.goal; }
      if (d.small)       el('set-small').value = d.small;
      if (d.medium)      el('set-medium').value = d.medium;
      if (d.large)       el('set-large').value = d.large;
      if (d.rate)        App.setRate(d.rate);
      if (d.vol !== undefined) App.setVolume(d.vol * 100);
      if (d.sfx !== undefined) App.setSfxVolume(d.sfx * 100);
      if (d.announceLikes !== undefined) { S.announceLikes = d.announceLikes; el('en-likes').checked = d.announceLikes; }
    } catch(_) {}
    Nicknames.load(); Keywords.load(); Loyalty.load();
    SoundManager.load();
    GiftLibrary.load();
    this.updateGoal();
  },
  save() {
    localStorage.setItem('tla-v4', JSON.stringify({
      name: g('set-name'), wakeWord: g('set-wakeword'),
      water: +g('set-water'), followNudge: +g('set-follow-nudge'),
      socials: +g('set-socials'), posture: +g('set-posture'),
      viewerT: +g('set-viewers-timer'), earnings: +g('set-earnings'),
      goal: +g('set-goal'), small: +g('set-small'),
      medium: +g('set-medium'), large: +g('set-large'),
      rate: S.speechRate, vol: S.voiceVolume, sfx: S.sfxVolume,
      announceLikes: S.announceLikes
    }));
  },
  saveGoal() { S.giftGoal = +g('set-goal') || 1000; this.save(); this.updateGoal(); },
  updateGoal() {
    if (!S.giftGoal) { el('goal-label').textContent = 'Set a gift goal in Settings'; el('goal-pct').textContent = ''; el('goal-fill').style.width='0%'; return; }
    const pct = Math.min(100, Math.round((S.giftGoalProgress / S.giftGoal) * 100));
    el('goal-label').textContent = `${S.giftGoalProgress.toLocaleString()} / ${S.giftGoal.toLocaleString()} coins`;
    el('goal-fill').style.width = pct + '%';
    el('goal-pct').textContent = pct + '%';
  },
  reset() {
    if (!confirm('Reset ALL settings?')) return;
    ['tla-v4','tla-wizard','tla-nicks','tla-kw','tla-loyalty','tla-sounds-v2','tla-voice','tla-sessionid'].forEach(k => localStorage.removeItem(k));
    location.reload();
  }
};

// ══════════════════════════════════════════════════════════════
// EVENTS
// ══════════════════════════════════════════════════════════════
const Events = {
  comment(username, text) {
    S.commentsTonight++;
    el('s-comments') && (el('s-comments').textContent = S.commentsTonight);

    if (S.toxicFilter && TOXIC_WORDS.some(w => text.toLowerCase().includes(w))) {
      UI.log('system', username, 'Skipped: inappropriate comment', '🚫'); return;
    }
    let clean = text;
    if (S.bleepProfanity) PROFANITY.forEach(w => { clean = clean.replace(new RegExp(w,'gi'),'****'); });

    const key = clean.toLowerCase().trim().slice(0,40);
    S.spamTracker[key] = (S.spamTracker[key]||0)+1;
    if (S.spamTracker[key] > 3) return;
    setTimeout(() => delete S.spamTracker[key], 25000);

    S.commentCounts[username] = (S.commentCounts[username]||0)+1;
    if (S.commentCounts[username] > S.topCommenterCount) {
      S.topCommenterCount = S.commentCounts[username]; S.topCommenter = username;
      el('top-commenter').textContent = `${username} (${S.topCommenterCount})`;
    }

    clearTimeout(S.silenceTimer);
    S.silenceTimer = setTimeout(() => Queue.add('Chat has gone quiet — good time to ask your audience a question!','system',7), 60000);

    const kwReply = Keywords.check(clean.toLowerCase());
    if (kwReply) { Queue.add(kwReply,'comment',5,SoundManager.get('comment'),{pitch:1.1}); UI.log('comment',username,text,'💬'); return; }

    const nick = Nicknames.get(username);
    if (nick) { Queue.add(nick,'comment',4,SoundManager.get('comment'),{pitch:1.1}); UI.log('comment',username,text,'👋'); return; }

    if (!S.firstCommentDone) {
      S.firstCommentDone = true;
      Queue.add(`First comment tonight goes to ${username} — they say: ${clean}`,'milestone',2,SoundManager.get('milestone'),{pitch:1.15});
      UI.log('milestone',username,`FIRST: ${text}`,'⭐'); UI.flash('green'); return;
    }

    if (clean.includes('?') && en('en-questions') && !S.safeMode) {
      Queue.add(`Question from ${username}: ${clean}`,'question',3,SoundManager.get('comment'),{pitch:1.12});
      UI.log('question',username,text,'❓'); return;
    }

    if (/\bso\b/.test(clean.toLowerCase()) || clean.toLowerCase().includes('shoutout')) {
      Queue.add(`Shoutout request from ${username}!`,'comment',4,SoundManager.get('comment'));
      UI.log('comment',username,`Shoutout: ${text}`,'📢'); return;
    }

    if (S.pollActive) { const l=clean.toLowerCase().trim(); if(l==='yes')S.pollResults.yes++;else if(l==='no')S.pollResults.no++; }
    if (S.fttActive && S.fttWord && clean.toLowerCase().includes(S.fttWord.toLowerCase())) {
      S.fttActive = false;
      Queue.add(`We have a winner! ${username} was first to type ${S.fttWord}!`,'milestone',1,SoundManager.get('milestone'),{pitch:1.2});
      UI.log('game',username,'Won First To Type!','🏆'); el('game-status').textContent=`Winner: ${username}`; UI.flash('green'); return;
    }
    if (S.giveawayActive) S.giveawayEntrants.add(username);
    if (S.safeMode || S.qaMode || !en('en-comments')) return;

    S.activitySpike.push(Date.now());
    S.activitySpike = S.activitySpike.filter(t => Date.now()-t < 5000);
    if (S.activitySpike.length >= 8) {
      S.activitySpike = [];
      Queue.add('Something just set chat off — that could be a highlight moment!','system',5);
      UI.log('system','System','📍 Highlight!','📍');
    }

    Queue.add(`${username} says: ${clean}`,'comment',7,SoundManager.get('comment'));
    UI.log('comment',username,text,'💬');
  },

  follow(username) {
    if (!en('en-follows')) return;
    S.followsTonight++;
    el('s-follows').textContent = S.followsTonight;
    const hist = S.viewerHistory[username]||{visits:0};
    S.viewerHistory[username] = {visits:hist.visits+1, lastSeen:Date.now()};
    Loyalty.check(username, hist.visits+1);
    const msg = hist.visits > 0
      ? `Welcome back ${username}! Great to see you again!`
      : `New follower! Welcome to the family, ${username}!`;
    Queue.add(msg,'follow',3,SoundManager.get('follow'),{pitch:1.1});
    UI.log('follow',username,hist.visits>0?'Returned':'New follow','➕');
    UI.flash('green');
    [10,25,50,100,250,500].forEach(m => {
      if (S.followsTonight>=m && !S.followMilestones.has(m) && en('en-milestones')) {
        S.followMilestones.add(m);
        Queue.add(`You just gained your ${m}th follow tonight! Amazing, thank you all!`,'milestone',2,SoundManager.get('milestone'),{pitch:1.2});
        UI.log('milestone','System',`${m} follows!`,'🎉'); UI.flash('green');
      }
    });
  },

  like(username, count, total) {
    S.likesTonight += count || 1;
    el('s-likes').textContent = S.likesTonight;
    if (!S.announceLikes || !en('en-likes')) return;
    // Only announce every 50 likes to avoid spam
    if (S.likesTonight % 50 === 0) {
      Queue.add(`${S.likesTonight} likes tonight! Thank you so much everyone!`,'like',6,SoundManager.get('like'));
      UI.log('like','Likes',`${S.likesTonight} total likes`,'❤');
    } else {
      Audio.play(SoundManager.get('like'));
      UI.log('like',username,`Liked the stream ❤`,'❤');
    }
  },

  gift(username, giftName, coins, emoji, repeatCount) {
    if (!en('en-gifts')) return;
    S.coinsTonight += coins; S.giftsTonight++;
    el('s-coins').textContent = S.coinsTonight.toLocaleString();
    el('s-gifts').textContent = S.giftsTonight;

    S.giftCounts[username] = (S.giftCounts[username]||0)+coins;
    if (S.giftCounts[username] > S.topGifterCoins) {
      S.topGifterCoins = S.giftCounts[username]; S.topGifter = username;
      el('top-gifter').textContent = `${username} (${S.topGifterCoins.toLocaleString()} coins)`;
    }

    const prev = S.giftStreaks[username];
    if (prev && prev.gift===giftName) { prev.count++; clearTimeout(S.giftStreakTimers[username]); }
    else S.giftStreaks[username] = {gift:giftName, count:repeatCount||1};
    S.giftStreakTimers[username] = setTimeout(()=>delete S.giftStreaks[username], 10000);
    const streak = S.giftStreaks[username].count;

    S.giftGoalProgress += coins;
    this.checkGoal(); Settings.updateGoal();

    // Auto-learn unknown gifts
    const giftId = giftName.toLowerCase().replace(/[^a-z0-9]/g,'_');
    if (!GiftLibrary.gifts.find(g => g.id === giftId || g.name.toLowerCase() === giftName.toLowerCase())) {
      GiftLibrary.learnGift(giftName, coins, emoji || '🎁');
    }

    const small  = +g('set-small')  || 100;
    const medium = +g('set-medium') || 1000;
    const large  = +g('set-large')  || 5000;
    let size = coins>=large ? 'large' : coins>=medium ? 'medium' : 'small';

    // Per-gift sound takes priority over size-based
    const perGiftSound = GiftLibrary.getSound(giftId, giftName);
    const sound = perGiftSound || SoundManager.getForGift(giftName, size);

    let msg, priority, opts={};
    if (size==='large') {
      msg = streak>1
        ? `Oh my goodness! ${username} is on a ${streak} times streak of ${giftName}! That is absolutely incredible, thank you so much!`
        : `Oh my goodness! ${username} just sent a ${giftName}! That is an incredible gift, thank you so much!`;
      priority=1; opts={pitch:.88,gender:'male',rate:S.speechRate*.9};
      UI.flash('gold'); setTimeout(()=>UI.flash('gold'),350);
    } else if (size==='medium') {
      msg = streak>1 ? `${username} is on a ${streak} streak of ${giftName}! Amazing!` : `Wow! ${username} sent a ${giftName}, thank you so much!`;
      priority=2; opts={pitch:1.05}; UI.flash('gold');
    } else {
      msg = streak>1 ? `${username} is on a ${streak} ${giftName} streak!` : `${username} sent a ${giftName}, thank you!`;
      priority=4; opts={pitch:1.0};
    }

    Queue.add(msg,'gift',priority,sound,opts);
    UI.log('gift',username,`${emoji||'🎁'} ${giftName} (${coins.toLocaleString()} coins)${streak>1?` — ${streak}× streak!`:''}`,emoji||'🎁');
  },

  share(username) {
    if (!en('en-shares')) return;
    Queue.add(`${username} just shared your stream — absolute legend, thank you!`,'share',4,SoundManager.get('share'),{pitch:1.1});
    UI.log('share',username,'Shared the stream','📤');
  },

  subscribe(username) {
    Queue.add(`${username} just subscribed! Welcome to the family!`,'milestone',3,SoundManager.get('milestone'),{pitch:1.15});
    UI.log('subscribe',username,'New subscriber!','⭐'); UI.flash('gold');
  },

  viewers(count) {
    S.viewers=count;
    if(count>S.peakViewers) S.peakViewers=count;
    el('s-viewers').textContent=count;
    [10,25,50,100,250,500,1000].forEach(m=>{
      if(count>=m&&!S.viewerMilestones.has(m)&&en('en-milestones')){
        S.viewerMilestones.add(m);
        Queue.add(`Incredible! You just hit ${m.toLocaleString()} viewers!`,'milestone',2,SoundManager.get('milestone'),{pitch:1.2});
        UI.log('milestone','System',`${m} viewers!`,'🎉'); UI.flash('green');
      }
    });
  },

  checkGoal() {
    if(!S.giftGoal) return;
    const pct=(S.giftGoalProgress/S.giftGoal)*100;
    [25,50,75,100].forEach(m=>{
      if(pct>=m&&!S.goalMilestonesHit.includes(m)){
        S.goalMilestonesHit.push(m);
        const msg=m===100
          ?`Goal reached! You hit ${S.giftGoal.toLocaleString()} coins tonight! Incredible, thank you!`
          :`You are now ${m}% toward your gift goal of ${S.giftGoal.toLocaleString()} coins!`;
        Queue.add(msg,'milestone',m===100?1:3,m===100?SoundManager.get('milestone'):SoundManager.get('small'));
        if(m===100){UI.flash('gold');UI.flash('gold');}
      }
    });
  }
};

// ══════════════════════════════════════════════════════════════
// LOYALTY, NICKNAMES, KEYWORDS
// ══════════════════════════════════════════════════════════════
const Loyalty = {
  data:{},
  tiers:[{visits:50,name:'Legend'},{visits:25,name:'Gold Regular'},{visits:10,name:'Silver Regular'},{visits:3,name:'Bronze Regular'}],
  load(){try{this.data=JSON.parse(localStorage.getItem('tla-loyalty')||'{}');}catch(_){}},
  save(){localStorage.setItem('tla-loyalty',JSON.stringify(this.data));},
  check(username,visits){
    const prev=this.data[username]||0;
    const prevT=this.tiers.find(t=>prev>=t.visits);
    const newT=this.tiers.find(t=>visits>=t.visits);
    if(newT&&(!prevT||newT.name!==prevT.name)){
      Queue.add(`${username} just became a ${newT.name}! They have been here ${visits} times!`,'milestone',3,SoundManager.get('milestone'));
      UI.log('milestone',username,`Tier: ${newT.name}!`,'🏆');
    }
    this.data[username]=visits; this.save();
  }
};

const Nicknames = {
  data:{},
  load(){try{this.data=JSON.parse(localStorage.getItem('tla-nicks')||'{}');}catch(_){}this.render();},
  add(){const u=el('nick-user').value.trim().toLowerCase(),gv=el('nick-greeting').value.trim();if(!u||!gv)return;this.data[u]=gv;localStorage.setItem('tla-nicks',JSON.stringify(this.data));el('nick-user').value='';el('nick-greeting').value='';this.render();},
  remove(u){delete this.data[u];localStorage.setItem('tla-nicks',JSON.stringify(this.data));this.render();},
  get(username){return this.data[username.toLowerCase()]||null;},
  render(){el('nicknames-list').innerHTML=Object.entries(this.data).map(([u,gv])=>`<span class="tag" onclick="Nicknames.remove('${u}')">${u}: "${gv}" ✕</span>`).join('');}
};

const Keywords = {
  defaults:{'first time':"Welcome to your first stream, so glad you are here!",'hello':"Hey there, welcome in!",'love you':"Love you too, thank you!",'how are you':"I am doing amazing, thank you for asking!"},
  data:{},
  load(){try{this.data=JSON.parse(localStorage.getItem('tla-kw')||'{}');}catch(_){}if(!Object.keys(this.data).length)this.data={...this.defaults};this.render();},
  add(){const t=el('kw-trigger').value.trim().toLowerCase(),r=el('kw-response').value.trim();if(!t||!r)return;this.data[t]=r;localStorage.setItem('tla-kw',JSON.stringify(this.data));el('kw-trigger').value='';el('kw-response').value='';this.render();},
  remove(t){delete this.data[t];localStorage.setItem('tla-kw',JSON.stringify(this.data));this.render();},
  check(text){return this.data[Object.keys(this.data).find(k=>text.includes(k))]||null;},
  render(){el('keywords-list').innerHTML=Object.entries(this.data).map(([t,r])=>`<span class="tag" onclick="Keywords.remove('${t}')">"${t}" ✕</span>`).join('');}
};

// ══════════════════════════════════════════════════════════════
// GAMES
// ══════════════════════════════════════════════════════════════
const Games = {
  poll(){const q=prompt('Poll question:');if(!q)return;S.pollActive=true;S.pollResults={yes:0,no:0};Queue.add(`Poll time! ${q} — type YES or NO in chat now!`,'milestone',2,SoundManager.get('milestone'),{pitch:1.1});el('game-status').textContent=`Poll (30s): ${q}`;clearTimeout(S.pollTimer);S.pollTimer=setTimeout(()=>{S.pollActive=false;const tot=S.pollResults.yes+S.pollResults.no;if(tot){const yp=Math.round((S.pollResults.yes/tot)*100);Queue.add(`Poll: ${yp}% yes, ${100-yp}% no from ${tot} votes!`,'milestone',2,SoundManager.get('milestone'));}else Queue.add('Poll ended with no votes.','system',5);el('game-status').textContent=`Poll ended — Yes:${S.pollResults.yes} No:${S.pollResults.no}`;},30000);},
  firstToType(){const w=prompt('What word should they type first?');if(!w)return;S.fttActive=true;S.fttWord=w;Queue.add(`First person to type ${w} wins a shoutout!`,'milestone',2,SoundManager.get('milestone'),{pitch:1.1});el('game-status').textContent=`Waiting for: "${w}"`;},
  startGiveaway(){S.giveawayActive=true;S.giveawayEntrants=new Set();Queue.add('Giveaway active! Everyone commenting is entered to win!','milestone',2,SoundManager.get('milestone'),{pitch:1.15});el('game-status').textContent='Giveaway active';const t=setInterval(()=>{if(!S.giveawayActive){clearInterval(t);return;}el('game-status').textContent=`Giveaway — ${S.giveawayEntrants.size} entrants`;},2000);},
  pickWinner(){const ents=[...S.giveawayEntrants];S.giveawayActive=false;if(!ents.length){Queue.add('No entrants — start a giveaway first!','system',4);return;}const w=ents[Math.floor(Math.random()*ents.length)];Queue.add('Drumroll please...','system',2,SoundManager.get('small'));setTimeout(()=>{Queue.add(`And the winner is... ${w}! Congratulations!`,'milestone',1,SoundManager.get('milestone'),{pitch:1.2});el('game-status').textContent=`Winner: ${w}`;UI.flash('gold');},2500);},
  wheel(){const raw=prompt('Wheel options (comma separated):');if(!raw)return;const opts=raw.split(',').map(s=>s.trim()).filter(Boolean);if(opts.length<2)return;Queue.add('The wheel is spinning...','system',3,SoundManager.get('small'));let ticks=0;const iv=setInterval(()=>{Audio.play('Notification');ticks++;if(ticks>=20){clearInterval(iv);const r=opts[Math.floor(Math.random()*opts.length)];setTimeout(()=>{Queue.add(`The wheel has landed on... ${r}!`,'milestone',1,SoundManager.get('milestone'),{pitch:1.15});el('game-status').textContent=`Wheel: ${r}`;},600);}},120+ticks*8);},
  countdown(){const mins=+(prompt('Count down from how many minutes?','5')||0);if(!mins)return;let secs=mins*60;Queue.add(`Starting a ${mins} minute countdown!`,'system',3);el('game-status').textContent=`Countdown: ${mins}:00`;clearInterval(S.countdownTimer);const marks=[300,180,120,60,30,10,9,8,7,6,5,4,3,2,1];S.countdownTimer=setInterval(()=>{secs--;const m=Math.floor(secs/60),s=secs%60;el('game-status').textContent=`${m}:${String(s).padStart(2,'0')}`;if(marks.includes(secs)){if(secs>60)Queue.add(`${m} minutes remaining!`,'system',6);else if(secs>10)Queue.add(`${secs} seconds!`,'system',4);else if(secs>0)Queue.add(`${secs}!`,'system',2,null,{rate:1.5});else{Queue.add('Time is up! Go go go!','milestone',1,SoundManager.get('milestone'),{pitch:1.2});clearInterval(S.countdownTimer);el('game-status').textContent='Done!';}}},1000);},
  stop(){S.pollActive=S.fttActive=S.giveawayActive=false;clearTimeout(S.pollTimer);clearInterval(S.countdownTimer);el('game-status').textContent='Stopped';Queue.add('All games stopped.','system',5);}
};

// ══════════════════════════════════════════════════════════════
// REMINDERS
// ══════════════════════════════════════════════════════════════
const Reminders = {
  start() {
    this.stop();
    if (!en('en-reminders')) return;
    const add=(fn,mins)=>{S.reminderIntervals.push(setInterval(fn,mins*60000));};
    add(()=>Queue.add("Hey, have you had some water? Take a quick sip!",'system',7,null,{volume:1.0}),+g('set-water')||20);
    add(()=>Queue.add("Don't forget to ask viewers to hit that follow button!",'system',7,null,{volume:1.0}),+g('set-follow-nudge')||15);
    add(()=>Queue.add("Good time to mention your other social media!",'system',7,null,{volume:1.0}),+g('set-socials')||25);
    add(()=>Queue.add("Quick posture check! Sit up straight and take a breath.",'system',8,null,{volume:.9}),+g('set-posture')||45);
    add(()=>Queue.add(`Stats: ${S.viewers} viewers, ${S.followsTonight} follows, ${S.coinsTonight.toLocaleString()} coins.`,'system',6),+g('set-viewers-timer')||5);
    add(()=>Queue.add(`Earnings tonight: ${S.coinsTonight.toLocaleString()} coins.${S.topGifter?` Top gifter: ${S.topGifter}.`:''}`,'system',6),+g('set-earnings')||10);
    S.reminderIntervals.push(setInterval(()=>{const m=Math.floor(S.streamDuration/60),h=Math.floor(m/60),min=m%60;const dur=h>0?`${h} hour${h>1?'s':''} and ${min} minutes`:`${m} minutes`;Queue.add(`You have been live for ${dur}.`,'system',8,null,{volume:.9});},30*60000));
  },
  stop(){S.reminderIntervals.forEach(clearInterval);S.reminderIntervals=[];}
};

// ══════════════════════════════════════════════════════════════
// VOICE COMMANDS
// ══════════════════════════════════════════════════════════════
const VoiceCmd = {
  rec:null,
  init(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('Voice commands need Chrome or Edge.');return false;}this.rec=new SR();this.rec.continuous=true;this.rec.interimResults=false;this.rec.lang='en-GB';this.rec.onresult=e=>{const t=e.results[e.results.length-1][0].transcript.toLowerCase().trim();this.handle(t);};this.rec.onerror=e=>{if(e.error!=='no-speech'){S.vcEnabled=false;el('vc-toggle').checked=false;UI.updateVoice();}};this.rec.onend=()=>{if(S.vcEnabled){try{this.rec.start();}catch(_){}}};return true;},
  start(){if(!this.rec&&!this.init())return;try{this.rec.start();}catch(_){}UI.updateVoice();},
  stop(){try{this.rec&&this.rec.stop();}catch(_){}UI.updateVoice();},
  handle(text){
    const wake=(g('set-wakeword')||'hey stream').toLowerCase();
    if(!text.includes(wake))return;
    const cmd=text.replace(new RegExp(wake,'g'),'').trim();
    UI.log('system','Voice',cmd,'🎤');
    if(cmd.includes('skip'))App.skip();
    else if(cmd.includes('repeat'))App.repeatLast();
    else if(cmd.includes('unmute')){if(S.isMuted)App.toggleMute();}
    else if(cmd.includes('mute'))App.toggleMute();
    else if(cmd.includes('how long')){const m=Math.floor(S.streamDuration/60);Queue.add(`You have been live for ${m} minutes.`,'system',2);}
    else if(cmd.includes('stats'))App.readStats();
    else if(cmd.includes('qa mode')||cmd.includes('q and a'))App.setQA(!S.qaMode);
    else if(cmd.includes('water'))App.waterBreak();
    else if(cmd.includes('panic'))App.panic();
    else if(cmd.includes('slow down'))App.setRate(Math.max(.5,S.speechRate-.25));
    else if(cmd.includes('speed up'))App.setRate(Math.min(2.5,S.speechRate+.25));
    else if(cmd.includes('earnings'))Queue.add(`${S.coinsTonight.toLocaleString()} coins tonight.`,'system',2);
    else if(cmd.includes('top gifter'))Queue.add(S.topGifter?`Top gifter: ${S.topGifter} with ${S.topGifterCoins.toLocaleString()} coins.`:'No gifts yet.','system',2);
    else if(cmd.includes('good night'))App.endStream();
    else if(cmd.startsWith('shoutout')){const n=cmd.replace('shoutout','').trim();if(n)Queue.add(`Shoutout to the amazing ${n}! Go show them some love!`,'milestone',2,SoundManager.get('milestone'),{pitch:1.1});}
  }
};

// ══════════════════════════════════════════════════════════════
// TIKTOK CONNECTION
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// DIAMOND GLOW MEMBERS
// ══════════════════════════════════════════════════════════════
const DIAMOND_GLOW = [
  { name:'Bec',     handle:'rebeccalouiseking68' },
  { name:'Chloe',   handle:'itzchloebitches' },
  { name:'Chris',   handle:'chris_20234' },
  { name:'Danny',   handle:'demonking66613' },
  { name:'David',   handle:'david___24___' },
  { name:'Dem',     handle:'demiking32' },
  { name:'Devin',   handle:'devnation3' },
  { name:'Ellie',   handle:'xelliexloux' },
  { name:'Emily',   handle:'emilybridge' },
  { name:'Keano',   handle:'kristenkeano' },
  { name:'Lady D',  handle:'thisismeladyd7' },
  { name:'Liam',    handle:'l.ward9999' },
  { name:'Reiss',   handle:'chubby_cub96' },
  { name:'Rob',     handle:'rob.bitton96' },
  { name:'Rory',    handle:'atmyexpenselive' },
  { name:'TeeTee',  handle:'cheekytia92' },
  { name:'That Guy',handle:'kingcobra7796' }
];

// ══════════════════════════════════════════════════════════════
// TIKTOK CONNECTION
// ══════════════════════════════════════════════════════════════
const TikTok = {
  liveStatus: {}, // handle -> true/false/null(unknown)
  guideStep: 0,
  guideSteps: [
    "Step 1. Open a new tab and go to tiktok dot com. Log in if you are not already. Come back here and press Next.",
    "Step 2. On the TikTok website press the F 12 key on your keyboard. This opens the developer tools. Press Next when it has opened.",
    "Step 3. In developer tools click the tab at the top that says Application. It might be hidden — look for a double arrow button. Press Next.",
    "Step 4. On the left side find the word Cookies and click the arrow to expand it. Then click tiktok dot com underneath. Press Next.",
    "Step 5. Find the cookie called sessionid in the list — all one word, lowercase. Click it, then copy the long value on the right. Press Next.",
    "Step 6. Paste that value into the Session ID box and press Connect. Done — the app remembers it forever."
  ],

  toggleConnect() {
    if (S.tiktokConnected) { socket.emit('disconnect-tiktok'); return; }
    this.showModal();
  },

  showModal() {
    el('tiktok-modal').classList.remove('hidden');
    el('modal-error').textContent = '';
    el('tiktok-username-input').value = '';
    const saved = localStorage.getItem('tla-sessionid');
    if (saved) el('tiktok-session-input').value = saved;
    this.renderMembers();
    this.renderSaved();
    setTimeout(() => el('tiktok-username-input').focus(), 100);
    el('tiktok-username-input').onkeydown = e => { if(e.key==='Enter') TikTok.connect(); };
    el('tiktok-session-input').onkeydown  = e => { if(e.key==='Enter') TikTok.connect(); };
  },

  closeModal() {
    el('tiktok-modal').classList.add('hidden');
    Speech.cancel();
  },

  renderMembers() {
    const list = el('dg-list');
    list.innerHTML = DIAMOND_GLOW.map(m => {
      const status = this.liveStatus[m.handle];
      let dotClass = 'dg-dot';
      let badge = '';
      if (status === true)  { dotClass += ' live'; badge = '<span class="dg-live-badge">LIVE</span>'; }
      if (status === false) { dotClass += ' offline'; }
      if (status === 'checking') { dotClass += ' checking'; }
      return `<div class="dg-member" onclick="TikTok.selectMember('${m.handle}')" aria-label="Connect to ${m.name}">
        <span class="${dotClass}"></span>
        <span class="dg-name">${m.name}</span>
        <span class="dg-handle">@${m.handle}</span>
        ${badge}
      </div>`;
    }).join('');
  },

  selectMember(handle) {
    el('tiktok-username-input').value = handle;
    el('tiktok-username-input').focus();
  },

  async checkLiveStatus() {
    const btn = el('dg-refresh');
    if (btn) { btn.textContent = '⏳ Checking...'; btn.disabled = true; }
    DIAMOND_GLOW.forEach(m => this.liveStatus[m.handle] = 'checking');
    this.renderMembers();
    try {
      const res = await fetch('/api/live-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: DIAMOND_GLOW.map(m => m.handle) })
      });
      if (res.ok) {
        const data = await res.json();
        DIAMOND_GLOW.forEach(m => { this.liveStatus[m.handle] = data[m.handle] || false; });
        const live = DIAMOND_GLOW.filter(m => this.liveStatus[m.handle] === true);
        if (live.length > 0) {
          const names = live.map(m => m.name).join(', ');
          Speech.speak(`${live.length} Diamond Glow member${live.length > 1 ? 's are' : ' is'} live right now: ${names}`, { rate: S.speechRate, volume: 1.0 });
        } else {
          Speech.speak('No Diamond Glow members appear to be live right now.', { rate: S.speechRate, volume: 1.0 });
        }
      } else {
        DIAMOND_GLOW.forEach(m => this.liveStatus[m.handle] = false);
      }
    } catch(e) {
      DIAMOND_GLOW.forEach(m => this.liveStatus[m.handle] = false);
    }
    this.renderMembers();
    if (btn) { btn.textContent = '🔄 Check Live'; btn.disabled = false; }
  },

  connect() {
    const username  = el('tiktok-username-input').value.trim().replace('@','');
    const sessionId = el('tiktok-session-input').value.trim();
    if (!username) {
      el('modal-error').textContent = 'Please enter a username.';
      Speech.speak('Please enter a username to connect to.', { volume: 1.0 });
      return;
    }
    el('modal-error').textContent = 'Connecting...';
    if (sessionId) localStorage.setItem('tla-sessionid', sessionId);
    this.saveUsername(username);
    socket.emit('connect-tiktok', { username, sessionId });
  },

  // Saved usernames
  saveUsername(username) {
    let saved = JSON.parse(localStorage.getItem('tla-saved-users') || '[]');
    saved = saved.filter(u => u !== username);
    saved.unshift(username);
    saved = saved.slice(0, 8); // keep last 8
    localStorage.setItem('tla-saved-users', JSON.stringify(saved));
  },

  removeSavedUsername(username) {
    let saved = JSON.parse(localStorage.getItem('tla-saved-users') || '[]');
    saved = saved.filter(u => u !== username);
    localStorage.setItem('tla-saved-users', JSON.stringify(saved));
    this.renderSaved();
  },

  renderSaved() {
    const saved = JSON.parse(localStorage.getItem('tla-saved-users') || '[]');
    const box = el('saved-users-box');
    const list = el('saved-list');
    if (!saved.length) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    list.innerHTML = saved.map(u =>
      `<span class="saved-chip" onclick="TikTok.selectSaved('${u}')">
        @${u}
        <span class="saved-chip-remove" onclick="event.stopPropagation();TikTok.removeSavedUsername('${u}')">✕</span>
      </span>`
    ).join('');
  },

  selectSaved(username) {
    el('tiktok-username-input').value = username;
    el('tiktok-username-input').focus();
  },

  startGuide()  { this.guideStep = 0; this.readStep(); },
  readStep()    { const t = this.guideSteps[this.guideStep]; el('guide-text').textContent = t; el('guide-step-num').textContent = `Step ${this.guideStep+1} of ${this.guideSteps.length}`; Speech.cancel(); Speech.speak(t, { rate:.92, volume:1.0 }); },
  guideNext()   { if(this.guideStep < this.guideSteps.length-1) { this.guideStep++; this.readStep(); } },
  guidePrev()   { if(this.guideStep > 0) { this.guideStep--; this.readStep(); } },
  repeatGuide() { Speech.cancel(); Speech.speak(this.guideSteps[this.guideStep], { rate:.92, volume:1.0 }); }
};

socket.on('tiktok-connecting',({username})=>{
  Speech.speak(`Connecting to ${username}'s live stream. Please wait.`);
  UI.log('system','TikTok',`Connecting to @${username}...`,'🔄');
});
socket.on('tiktok-connected',({username})=>{
  S.tiktokConnected=true; TikTok.closeModal();
  el('btn-connect').textContent='🔴 DISCONNECT'; el('btn-connect').classList.add('live');
  App.goLive();
  Queue.add(`Connected to ${username}'s TikTok live stream!`,'system',2,SoundManager.get('milestone'));
  UI.log('system','TikTok',`Connected @${username}`,'✅');
  el('live-dot').classList.add('on'); el('live-label').textContent='LIVE';
});
socket.on('tiktok-disconnected',({reason})=>{
  S.tiktokConnected=false;
  el('btn-connect').textContent='🔴 CONNECT TO TIKTOK'; el('btn-connect').classList.remove('live');
  Queue.add(`Disconnected. ${reason}`,'alert',2,SoundManager.get('milestone'));
  UI.log('alert','TikTok',`Disconnected: ${reason}`,'❌');
});
socket.on('tiktok-error',({message})=>{
  if(message==='SESSION_ID_NEEDED'){
    el('modal-error').textContent='Session ID required. Press the help button above to hear how to get it.';
    Speech.speak('Your Session ID is needed. Press the help button to hear step by step instructions. It only takes a minute and you only do it once.',{rate:.92,volume:1.0});
  } else {
    el('modal-error').textContent=message||'Connection failed.';
  }
  UI.log('alert','TikTok',message,'⚠');
});
socket.on('event',data=>{
  switch(data.type){
    case 'comment':      Events.comment(data.username,data.text); break;
    case 'gift':         Events.gift(data.username,data.giftName,data.coins,data.emoji,data.repeatCount); break;
    case 'follow':       Events.follow(data.username); break;
    case 'like':         Events.like(data.username,data.count,data.total); break;
    case 'share':        Events.share(data.username); break;
    case 'subscribe':    Events.subscribe(data.username); break;
    case 'viewer_count': Events.viewers(data.count); break;
  }
});

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
const App = {
  goLive(){
    if(S.isLive)return;
    S.isLive=true; S.startTime=Date.now();
    el('live-dot').classList.add('on'); el('live-label').textContent='LIVE';
    S.streamInterval=setInterval(()=>{
      S.streamDuration++;
      const h=Math.floor(S.streamDuration/3600),m=Math.floor((S.streamDuration%3600)/60),s=S.streamDuration%60;
      el('stream-timer').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      el('s-time').textContent=h>0?`${h}h${String(m).padStart(2,'0')}m`:`${m}m`;
    },1000);
    Reminders.start();
  },
  preStreamChecklist(){
    Queue.add("Quick pre-stream check. Mic is on. Water is nearby. Battery is charged. You are ready. Have an absolutely amazing stream!",'system',10,null,{rate:.92,volume:1.0});
    UI.log('system','System','✅ Pre-stream check','✅');
  },
  toggleMute(){
    S.isMuted=!S.isMuted;
    if(S.isMuted){Speech.cancel();Queue.clear();el('mute-btn').textContent='🔇 MUTED — TAP TO UNMUTE';el('mute-btn').classList.add('muted');}
    else{el('mute-btn').textContent='🔊 UNMUTED';el('mute-btn').classList.remove('muted');}
  },
  setRate(val){S.speechRate=parseFloat(val);el('rate-slider').value=val;el('rate-val').textContent=parseFloat(val).toFixed(1)+'×';Settings.save();},
  setVolume(val){S.voiceVolume=val/100;el('vol-slider').value=val;el('vol-val').textContent=Math.round(val)+'%';Settings.save();},
  setSfxVolume(val){S.sfxVolume=val/100;el('sfx-slider').value=val;el('sfx-val').textContent=Math.round(val)+'%';},
  setQA(val){S.qaMode=val;el('qa-toggle').checked=val;Queue.add(val?'Q and A mode on. Only questions announced.':'Q and A mode off.','system',3);},
  setSafe(val){S.safeMode=val;Queue.add(val?'Safe mode on.':'Safe mode off.','system',3);},
  setCalm(val){S.calmMode=val;el('calm-toggle').checked=val;Queue.add(val?'Calm mode on.':'Calm mode off.','system',3);},
  setToxic(val){S.toxicFilter=val;},
  setBleep(val){S.bleepProfanity=val;},
  setVoiceCommands(val){S.vcEnabled=val;if(val){VoiceCmd.start();Queue.add(`Voice commands active. Say ${g('set-wakeword')||'hey stream'} followed by your command.`,'system',3);}else VoiceCmd.stop();},
  skip(){Speech.cancel();S.isAnnouncing=false;setTimeout(()=>Queue.next(),100);},
  repeatLast(){if(S.lastText)Queue.add(S.lastText,S.lastType,2);},
  readStats(){const m=Math.floor(S.streamDuration/60);Queue.add(`Stats: ${S.viewers} viewers, ${S.followsTonight} follows, ${S.coinsTonight.toLocaleString()} coins, live for ${m} minutes.${S.topGifter?` Top gifter: ${S.topGifter}.`:''}`,'system',2);},
  waterBreak(){Queue.clear();Queue.add("Taking a quick water break — back in a moment!",'system',1,null,{volume:1.0});setTimeout(()=>{if(!S.isMuted)Queue.add('Water break over — back and ready to go!','system',1);},5*60000);},
  panic(){
    Queue.clear();S.isMuted=false;
    Audio.play('Alert Beep');
    Speech.speak('Stream paused safely. You are okay. Take your time. Breathe.',{rate:.82,pitch:.9,volume:1.0,
      onend:()=>{S.isMuted=true;el('mute-btn').textContent='🔇 MUTED — TAP TO UNMUTE';el('mute-btn').classList.add('muted');}});
    UI.log('alert','PANIC','⚠ Panic activated','🚨');UI.flash('red');
  },
  endStream(){
    if(!confirm('End stream and hear your summary?'))return;
    Reminders.stop();S.isLive=false;clearInterval(S.streamInterval);Queue.clear();
    const m=Math.floor(S.streamDuration/60),h=Math.floor(m/60),mins=m%60;
    const dur=h>0?`${h} hour${h>1?'s':''} and ${mins} minutes`:`${m} minutes`;
    const s=`Tonight was a fantastic stream. You were live for ${dur}. You gained ${S.followsTonight} new followers. You earned approximately ${S.coinsTonight.toLocaleString()} coins. ${S.topGifter?`Top gifter was ${S.topGifter} with ${S.topGifterCoins.toLocaleString()} coins. `:''}${S.topCommenter?`Most active chatter was ${S.topCommenter}. `:''}Peak viewers was ${S.peakViewers}. You did an incredible job. Rest up and see you next time.`;
    Speech.speak(s,{rate:.9,volume:1.0});
    UI.log('system','Ended',s,'🔴');
    el('live-dot').classList.remove('on');el('live-label').textContent='ENDED';
    el('btn-connect').textContent='🔴 CONNECT TO TIKTOK';el('btn-connect').classList.remove('live');
    if(S.tiktokConnected)socket.emit('disconnect-tiktok');
  },
  handleKey(e){
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
    switch(e.key.toLowerCase()){
      case 'm':this.toggleMute();break;
      case 's':this.skip();break;
      case 'r':this.repeatLast();break;
      case 'p':this.panic();break;
      case 'q':this.setQA(!S.qaMode);break;
      case 'c':{const nv=!S.calmMode;el('calm-toggle').checked=nv;this.setCalm(nv);break;}
      case '-':this.setRate(Math.max(.5,S.speechRate-.1));break;
      case '=':case '+':this.setRate(Math.min(2.5,S.speechRate+.1));break;
    }
  }
};

// ══════════════════════════════════════════════════════════════
// TEST BUTTONS — preview without being live
// ══════════════════════════════════════════════════════════════
const Test = {
  comment()    {Events.comment(rand(FAKE_USERS),rand(FAKE_COMMENTS));},
  question()   {Events.comment(rand(FAKE_USERS),'What headset do you use for streaming?');},
  giftSmall()  {const g=FAKE_GIFTS[2];Events.gift('TestFan',g.n,g.c,g.e,1);},
  giftMedium() {const g=FAKE_GIFTS[7];Events.gift('TestFan',g.n,g.c,g.e,1);},
  giftLarge()  {const g=FAKE_GIFTS[10];Events.gift('VIPFan',g.n,g.c,g.e,1);},
  follow()     {Events.follow('NewFan'+Math.floor(Math.random()*99));},
  like()       {Events.like(rand(FAKE_USERS),5,50);},
  share()      {Events.share('ShareLegend');},
  milestone()  {Events.viewers(100);},
  alert()      {Queue.add('Warning! Test alert.','alert',1,'Alert Beep',{pitch:.85});UI.log('alert','System','Alert test','⚠');},
  streak()     {[1,2,3].forEach((_,i)=>setTimeout(()=>Events.gift('StreakFan','Rose',1,'🌹',i+1),i*400));},
  returnViewer(){S.viewerHistory['OldFriend']={visits:5,lastSeen:Date.now()-86400000};Events.follow('OldFriend');}
};

// ══════════════════════════════════════════════════════════════
// UI
// ══════════════════════════════════════════════════════════════
const UI = {
  log(type,username,text,icon){
    const c=el('log-container');
    const t=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const d=document.createElement('div');
    d.className='log-entry flash';
    d.innerHTML=`<span class="log-time">${t}</span><span class="log-badge ${type}">${type}</span><span class="log-text"><span class="un">${esc(username)}</span> — ${esc(text)}</span>`;
    c.appendChild(d);c.scrollTop=c.scrollHeight;
    setTimeout(()=>d.classList.remove('flash'),500);
  },
  clearLog(){el('log-container').innerHTML='';},
  setNP(item){
    el('np-type').textContent=item.type.toUpperCase();
    el('np-type').className='now-tag '+item.type;
    el('np-text').textContent=item.text;
    const bar=el('np-bar');
    bar.style.transition='none';bar.style.width='100%';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.transition='width 4s linear';bar.style.width='0%';}));
  },
  clearNP(){
    el('np-type').textContent='IDLE';el('np-type').className='now-tag';
    el('np-text').textContent='Waiting...';el('np-bar').style.width='0%';
  },
  updateQueue(){
    const n=S.queue.length;
    el('queue-count').textContent=n;
    el('queue-preview').textContent=n>0?`Next: ${S.queue[0].text.slice(0,35)}…`:'';
  },
  updateVoice(){
    el('voice-dot').className='voice-dot'+(S.vcEnabled?' on':'');
    el('voice-label').textContent=S.vcEnabled?'MIC ON':'MIC OFF';
  },
  flash(color){
    const o=el('flash-overlay');
    o.className=`flash-overlay ${color} show`;
    setTimeout(()=>o.classList.remove('show'),700);
  }
};

// ══════════════════════════════════════════════════════════════
// WIZARD
// ══════════════════════════════════════════════════════════════
const Wizard = {
  step:0,ans:{},
  steps:[
    {id:'name',type:'text',q:"Welcome to TikTok Live Announcer — built for accessibility. First, what is your streamer name?",placeholder:'Your name',def:'Streamer'},
    {id:'rate',type:'opts',q:"How fast would you like announcements to be read?",opts:[{l:'Slow',v:.8},{l:'Normal',v:1.0},{l:'Fast',v:1.2},{l:'Very Fast',v:1.5}],def:1.0},
    {id:'toxic',type:'opts',q:"Should we automatically skip abusive or hateful comments so you never hear them?",opts:[{l:'Yes — protect me',v:true},{l:'No — read everything',v:false}],def:true},
    {id:'goal',type:'text',q:"What is your coin goal for tonight? Enter a number or 0 for no goal.",placeholder:'e.g. 5000',def:'1000'},
    {id:'vc',type:'opts',q:"Would you like hands-free voice commands? Say hey stream followed by commands like skip, mute, stats. Needs Chrome or Edge.",opts:[{l:'Yes please',v:true},{l:'No thanks',v:false}],def:false},
    {id:'done',type:'finish',q:"All set! Your announcer is ready. Press Connect to TikTok when you are live, or use the Preview buttons to test each sound first."}
  ],
  start(){el('app').classList.add('hidden');el('wizard').classList.remove('hidden');this.step=0;this.ans={};this.render();},
  render(){
    const s=this.steps[this.step],total=this.steps.length;
    el('wiz-dots').innerHTML=Array.from({length:total},(_,i)=>`<div class="wiz-dot${i<=this.step?' on':''}"></div>`).join('');
    el('wiz-step').textContent=`Step ${this.step+1} of ${total}`;
    setTimeout(()=>{Speech.speak(s.q,{rate:1.0,volume:1.0});el('wiz-speaking').textContent='🔊 Speaking...';setTimeout(()=>el('wiz-speaking').textContent='',3500);},200);
    const c=el('wiz-content');
    c.innerHTML=`<p class="wiz-text">${s.q}</p>`;
    if(s.type==='text'){
      c.innerHTML+=`<input type="text" class="wiz-inp" id="wiz-inp" placeholder="${s.placeholder}" value="${s.def||''}"><button class="wiz-btn" onclick="Wizard.next()">Next →</button>`;
      setTimeout(()=>{const inp=document.getElementById('wiz-inp');if(inp){inp.focus();inp.addEventListener('keydown',e=>{if(e.key==='Enter')Wizard.next();});}},100);
    }else if(s.type==='opts'){
      c.innerHTML+=`<div class="wiz-opts">${s.opts.map(o=>`<button class="wiz-opt" data-val='${JSON.stringify(o.v)}' onclick="Wizard.pick(this,'${s.id}',this.dataset.val)">${o.l}</button>`).join('')}</div><button class="wiz-btn" onclick="Wizard.next()">Next →</button>`;
      const def=s.opts.find(o=>o.v===s.def);
      if(def)setTimeout(()=>{document.querySelectorAll('.wiz-opt').forEach(b=>{if(b.textContent===def.l){b.classList.add('on');this.ans[s.id]=s.def;}});},50);
    }else if(s.type==='finish'){
      c.innerHTML+=`<button class="wiz-btn" onclick="Wizard.finish()">🚀 Launch Announcer!</button>`;
    }
  },
  pick(btn,id,valStr){document.querySelectorAll('.wiz-opt').forEach(b=>b.classList.remove('on'));btn.classList.add('on');try{this.ans[id]=JSON.parse(valStr);}catch(_){this.ans[id]=valStr;}},
  next(){const s=this.steps[this.step];if(s.type==='text'){const inp=document.getElementById('wiz-inp');this.ans[s.id]=(inp?inp.value.trim():'')||s.def;}this.step++;if(this.step>=this.steps.length){this.finish();return;}this.render();},
  finish(){
    const a=this.ans;
    if(a.name)el('set-name').value=a.name;
    if(a.rate)App.setRate(a.rate);
    if(a.toxic!==undefined){S.toxicFilter=a.toxic;el('toxic-toggle').checked=a.toxic;}
    if(a.goal){el('set-goal').value=a.goal;Settings.saveGoal();}
    Settings.save();
    localStorage.setItem('tla-wizard','done');
    el('wizard').classList.add('hidden');el('app').classList.remove('hidden');
    setTimeout(()=>{
      Speech.speak(`Welcome ${a.name||'Streamer'}! Your announcer is all set. When you go live on TikTok, press the Connect to TikTok button and follow the instructions. You can preview every sound using the Preview buttons in the settings. Enjoy your stream!`,{rate:S.speechRate,volume:1.0});
      UI.log('system','System','🟢 Ready!','🟢');
      if(a.vc)setTimeout(()=>{el('vc-toggle').checked=true;App.setVoiceCommands(true);},4000);
    },300);
  }
};

// ── HELPERS ───────────────────────────────────────────────────
function el(id){return document.getElementById(id);}
function g(id){return el(id)?.value||'';}
function en(id){return el(id)?.checked!==false;}
function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
function esc(str){return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  // Load voices — retry a few times as browsers load them async
  const loadVoices=()=>{ VoicePicker.load(); };
  loadVoices();
  if(speechSynthesis.onvoiceschanged!==undefined) speechSynthesis.onvoiceschanged=loadVoices;
  setTimeout(loadVoices,500);
  setTimeout(loadVoices,1500);

  document.addEventListener('keydown',e=>App.handleKey(e));
  Settings.load();

  // Battery
  if(navigator.getBattery){navigator.getBattery().then(bat=>{const check=()=>{if(bat.level<.2&&!bat.charging)Queue.add(`Battery at ${Math.round(bat.level*100)}%. Please plug in soon.`,'alert',2,'Alert Beep');};bat.addEventListener('levelchange',check);setInterval(check,5*60000);});}

  if(!localStorage.getItem('tla-wizard')){
    Wizard.start();
  }else{
    el('wizard').classList.add('hidden');el('app').classList.remove('hidden');
    setTimeout(()=>{
      Speech.speak('TikTok Live Announcer is ready. Press Connect to TikTok to go live.',{rate:1.0,volume:1.0});
      UI.log('system','System','🟢 Ready!','🟢');
    },500);
  }
});
