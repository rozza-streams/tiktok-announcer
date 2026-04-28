'use strict';

// ── SOCKET ────────────────────────────────────────────────────
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
  'love your stream!','hello there!','first time here!',
  'this is amazing','you are so talented','keep it up!',
  'you are the best','what headset do you use?',
  'how long have you been streaming?','love the energy today',
  'giving you a follow now','so entertaining tonight',
  'you make my day every stream','can you do a shoutout please?',
  'love from the UK','never miss a stream'
];

const TOXIC_WORDS   = ['hate','stupid','idiot','ugly','kill yourself','die','loser','moron'];
const PROFANITY     = ['damn','crap','hell','bloody'];

// ── SOUND PRESETS ─────────────────────────────────────────────
// Each preset is a list of [freq, startSec, endSec, waveform, gain]
const SOUND_PRESETS = {
  'Coin Chime':      [[523,0,.08,'sine',.09],[659,.07,.15,'sine',.07]],
  'Bell Ding':       [[880,0,.04,'sine',.1],[880,.04,.2,'sine',.04]],
  'Pop':             [[400,0,.05,'sine',.1],[300,.04,.09,'sine',.06]],
  'Sparkle':         [[1046,0,.06,'sine',.07],[1318,.05,.11,'sine',.07],[1568,.1,.17,'sine',.06]],
  'Fanfare':         [[523,0,.1,'triangle',.08],[659,.08,.18,'triangle',.08],[784,.16,.26,'triangle',.08],[1047,.24,.38,'triangle',.1]],
  'Big Boom':        [[130,0,.15,'square',.04],[261,0,.1,'sine',.08],[523,.08,.2,'sine',.09],[784,.16,.3,'sine',.09],[1047,.28,.45,'sine',.1]],
  'Laser':           [[800,0,.12,'sawtooth',.04],[400,.06,.15,'sawtooth',.04]],
  'Gentle Chime':    [[659,0,.12,'sine',.06],[784,.1,.22,'sine',.06]],
  'Royal Fanfare':   [[261,0,.1,'square',.03],[392,0,.15,'sine',.08],[523,.08,.18,'sine',.1],[659,.15,.25,'sine',.1],[784,.22,.35,'sine',.09],[1047,.3,.5,'sine',.12]],
  'Alert Beep':      [[880,0,.12,'square',.05],[880,.15,.27,'square',.05]],
  'Happy Chime':     [[784,0,.1,'sine',.08],[988,.09,.18,'sine',.08],[1175,.17,.28,'sine',.08]],
  'Power Up':        [[261,0,.06,'square',.04],[330,.05,.11,'square',.04],[392,.1,.16,'square',.04],[523,.15,.24,'square',.05]],
  'Whoosh':          [[600,0,.15,'sawtooth',.03],[200,.08,.2,'sawtooth',.03]],
  'None':            []
};
const SOUND_NAMES = Object.keys(SOUND_PRESETS);

// ── STATE ─────────────────────────────────────────────────────
const S = {
  isLive:false, isMuted:false, isSimulating:false, tiktokConnected:false,
  startTime:null, streamDuration:0, streamInterval:null,
  viewers:0, peakViewers:0,
  followsTonight:0, coinsTonight:0, giftsTonight:0, commentsTonight:0,
  topGifter:'', topGifterCoins:0, topCommenter:'', topCommenterCount:0,
  giftGoal:1000, giftGoalProgress:0, goalMilestonesHit:[],
  qaMode:false, safeMode:false, calmMode:false,
  toxicFilter:true, bleepProfanity:false, vcEnabled:false,
  speechRate:1.0, voiceVolume:1.0, sfxVolume:0.8,
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
  playPreset(preset, vol) {
    if (!preset || !preset.length) return;
    try {
      this.init();
      const ctx = S.audioCtx;
      const master = ctx.createGain();
      master.gain.setValueAtTime((vol !== undefined ? vol : S.sfxVolume) * 0.3, ctx.currentTime);
      master.connect(ctx.destination);
      preset.forEach(([freq, start, end, wave, g]) => {
        const osc = ctx.createOscillator();
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
  play(name) {
    this.playPreset(SOUND_PRESETS[name] || SOUND_PRESETS['Coin Chime']);
  },
  // Built-in named sounds for non-gift events
  event(type) {
    const map = {
      comment:   'Pop',
      question:  'Gentle Chime',
      follow:    'Bell Ding',
      share:     'Gentle Chime',
      milestone: 'Fanfare',
      alert:     'Alert Beep',
      panic:     'Alert Beep',
      tick:      'Pop'
    };
    this.play(map[type] || 'Pop');
  }
};

// ══════════════════════════════════════════════════════════════
// GIFT SOUNDS
// ══════════════════════════════════════════════════════════════
const GiftSounds = {
  // defaults per size
  sizes: { small:'Coin Chime', medium:'Sparkle', large:'Royal Fanfare' },
  // custom per gift name: { 'Lion': 'Big Boom', ... }
  custom: {},

  load() {
    try {
      const d = JSON.parse(localStorage.getItem('tla-giftsounds') || '{}');
      if (d.sizes)  this.sizes  = { ...this.sizes,  ...d.sizes };
      if (d.custom) this.custom = { ...d.custom };
    } catch(_) {}
    this.populateSelects();
    this.render();
    // set select values
    el('sound-small').value  = this.sizes.small;
    el('sound-medium').value = this.sizes.medium;
    el('sound-large').value  = this.sizes.large;
  },

  save() {
    this.sizes.small  = el('sound-small').value;
    this.sizes.medium = el('sound-medium').value;
    this.sizes.large  = el('sound-large').value;
    localStorage.setItem('tla-giftsounds', JSON.stringify({ sizes: this.sizes, custom: this.custom }));
  },

  addCustom() {
    const name  = el('gs-name').value.trim();
    const sound = el('gs-sound').value;
    if (!name || !sound) return;
    this.custom[name.toLowerCase()] = sound;
    el('gs-name').value = '';
    this.save(); this.render();
  },

  removeCustom(name) {
    delete this.custom[name.toLowerCase()];
    this.save(); this.render();
  },

  // Pick sound for a gift — custom overrides size-based
  pick(giftName, size) {
    const key = (giftName || '').toLowerCase();
    if (this.custom[key]) return this.custom[key];
    return this.sizes[size] || 'Coin Chime';
  },

  test(size) {
    const name = el(`sound-${size}`).value;
    Audio.play(name);
  },

  populateSelects() {
    const ids = ['sound-small','sound-medium','sound-large','gs-sound'];
    ids.forEach(id => {
      const sel = el(id);
      if (!sel) return;
      sel.innerHTML = SOUND_NAMES.map(n => `<option value="${n}">${n}</option>`).join('');
    });
  },

  render() {
    el('gift-sounds-list').innerHTML = Object.entries(this.custom).map(([n,s]) =>
      `<span class="tag" onclick="GiftSounds.removeCustom('${n}')" title="Remove">${n} → ${s} ✕</span>`
    ).join('');
  }
};

// ══════════════════════════════════════════════════════════════
// SPEECH ENGINE
// ══════════════════════════════════════════════════════════════
const Speech = {
  voices: [],
  load() {
    const v = speechSynthesis.getVoices();
    if (v.length) this.voices = v;
  },
  getVoice(gender) {
    const en = this.voices.filter(v => v.lang && v.lang.startsWith('en'));
    if (!en.length) return null;
    if (gender === 'female')
      return en.find(v => /female|woman|zira|salli|joanna|samantha|victoria|karen|moira/i.test(v.name)) || en[0];
    if (gender === 'male')
      return en.find(v => /male|man|david|mark|alex|daniel|james|ryan/i.test(v.name)) || en[1] || en[0];
    return en[0];
  },
  speak(text, opts = {}) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate   = opts.rate   !== undefined ? opts.rate   : S.speechRate;
    u.pitch  = opts.pitch  !== undefined ? opts.pitch  : 1.0;
    u.volume = opts.volume !== undefined ? opts.volume : S.voiceVolume;
    const v = this.getVoice(opts.gender);
    if (v) u.voice = v;
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
    if (item.sound) { Audio.play(item.sound); setTimeout(() => this._speak(item), 320); }
    else this._speak(item);
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
      const d = JSON.parse(localStorage.getItem('tla-v3') || '{}');
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
    } catch(_) {}
    Nicknames.load(); Keywords.load(); Loyalty.load(); GiftSounds.load();
    this.updateGoal();
  },
  save() {
    localStorage.setItem('tla-v3', JSON.stringify({
      name: g('set-name'), wakeWord: g('set-wakeword'),
      water: +g('set-water'), followNudge: +g('set-follow-nudge'),
      socials: +g('set-socials'), posture: +g('set-posture'),
      viewerT: +g('set-viewers-timer'), earnings: +g('set-earnings'),
      goal: +g('set-goal'), small: +g('set-small'),
      medium: +g('set-medium'), large: +g('set-large'),
      rate: S.speechRate, vol: S.voiceVolume
    }));
  },
  saveGoal() { S.giftGoal = +g('set-goal') || 1000; this.save(); this.updateGoal(); },
  updateGoal() {
    if (S.giftGoal <= 0) { el('goal-label').textContent = 'Set a gift goal in Settings'; el('goal-pct').textContent = ''; el('goal-fill').style.width = '0%'; return; }
    const pct = Math.min(100, Math.round((S.giftGoalProgress / S.giftGoal) * 100));
    el('goal-label').textContent = `${S.giftGoalProgress.toLocaleString()} / ${S.giftGoal.toLocaleString()} coins`;
    el('goal-fill').style.width = pct + '%';
    el('goal-pct').textContent = pct + '%';
  },
  reset() {
    if (!confirm('Reset ALL settings to defaults? This cannot be undone.')) return;
    ['tla-v3','tla-wizard','tla-nicks','tla-kw','tla-loyalty','tla-giftsounds'].forEach(k => localStorage.removeItem(k));
    location.reload();
  }
};

// ══════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ══════════════════════════════════════════════════════════════
const Events = {
  comment(username, text) {
    S.commentsTonight++;
    el('s-comments').textContent = S.commentsTonight;

    if (S.toxicFilter && TOXIC_WORDS.some(w => text.toLowerCase().includes(w))) {
      UI.log('system', username, 'Skipped: inappropriate comment', '🚫'); return;
    }

    let clean = text;
    if (S.bleepProfanity) PROFANITY.forEach(w => { clean = clean.replace(new RegExp(w,'gi'),'****'); });

    // Spam filter
    const key = clean.toLowerCase().trim().slice(0,40);
    S.spamTracker[key] = (S.spamTracker[key] || 0) + 1;
    if (S.spamTracker[key] > 3) return;
    setTimeout(() => delete S.spamTracker[key], 25000);

    // Top commenter
    S.commentCounts[username] = (S.commentCounts[username] || 0) + 1;
    if (S.commentCounts[username] > S.topCommenterCount) {
      S.topCommenterCount = S.commentCounts[username];
      S.topCommenter = username;
      el('top-commenter').textContent = `${username} (${S.topCommenterCount})`;
    }

    // Silence timer
    clearTimeout(S.silenceTimer);
    S.silenceTimer = setTimeout(() => Queue.add('Chat has gone quiet — good time to ask your audience a question!','system',7), 60000);

    // Keyword trigger
    const kwReply = Keywords.check(clean.toLowerCase());
    if (kwReply) { Queue.add(kwReply,'comment',5,'Coin Chime',{pitch:1.1}); UI.log('comment',username,text,'💬'); return; }

    // Custom nickname
    const nick = Nicknames.get(username);
    if (nick) { Queue.add(nick,'comment',4,'Bell Ding',{pitch:1.1}); UI.log('comment',username,text,'👋'); return; }

    // First comment
    if (!S.firstCommentDone) {
      S.firstCommentDone = true;
      Queue.add(`First comment tonight goes to ${username} — they say: ${clean}`,'milestone',2,'Fanfare',{pitch:1.15});
      UI.log('milestone',username,`FIRST COMMENT: ${text}`,'⭐'); UI.flash('green'); return;
    }

    // Question
    if (clean.includes('?') && en('en-questions') && !S.safeMode) {
      Queue.add(`Question from ${username}: ${clean}`,'question',3,'Gentle Chime',{pitch:1.12,gender:'female'});
      UI.log('question',username,text,'❓'); return;
    }

    // Shoutout
    if (/\bso\b/.test(clean.toLowerCase()) || clean.toLowerCase().includes('shoutout')) {
      Queue.add(`Shoutout request from ${username}!`,'comment',4,'Pop');
      UI.log('comment',username,`Shoutout: ${text}`,'📢'); return;
    }

    // Poll / first-to-type / giveaway
    if (S.pollActive) { if (clean.toLowerCase().trim()==='yes') S.pollResults.yes++; else if (clean.toLowerCase().trim()==='no') S.pollResults.no++; }
    if (S.fttActive && S.fttWord && clean.toLowerCase().includes(S.fttWord.toLowerCase())) {
      S.fttActive = false;
      Queue.add(`We have a winner! ${username} was first to type ${S.fttWord}!`,'milestone',1,'Fanfare',{pitch:1.2});
      UI.log('game',username,'Won First To Type!','🏆'); el('game-status').textContent = `Winner: ${username}`; UI.flash('green'); return;
    }
    if (S.giveawayActive) S.giveawayEntrants.add(username);

    if (S.safeMode || S.qaMode || !en('en-comments')) return;

    // Activity spike
    S.activitySpike.push(Date.now());
    S.activitySpike = S.activitySpike.filter(t => Date.now()-t < 5000);
    if (S.activitySpike.length >= 8) { S.activitySpike = []; Queue.add('Something just set chat off — that could be a highlight moment!','system',5); UI.log('system','System','📍 Highlight moment?','📍'); }

    Queue.add(`${username} says: ${clean}`,'comment',7,'Pop');
    UI.log('comment',username,text,'💬');
  },

  follow(username) {
    if (!en('en-follows')) return;
    S.followsTonight++;
    el('s-follows').textContent = S.followsTonight;
    const hist = S.viewerHistory[username] || {visits:0};
    S.viewerHistory[username] = {visits: hist.visits+1, lastSeen: Date.now()};
    Loyalty.check(username, hist.visits+1);
    const msg = hist.visits > 0 ? `Welcome back ${username}! Great to see you again!` : `New follower! Welcome to the family, ${username}!`;
    Queue.add(msg,'follow',3,'Bell Ding',{pitch:1.1,gender:'female'});
    UI.log('follow',username, hist.visits>0?'Returned':'New follow','➕'); UI.flash('green');
    [10,25,50,100,250,500].forEach(m => {
      if (S.followsTonight>=m && !S.followMilestones.has(m) && en('en-milestones')) {
        S.followMilestones.add(m);
        Queue.add(`You just gained your ${m}th follow tonight! Incredible, thank you all!`,'milestone',2,'Fanfare',{pitch:1.2});
        UI.log('milestone','System',`${m} follows milestone!`,'🎉'); UI.flash('green');
      }
    });
  },

  gift(username, giftName, coins, emoji, repeatCount) {
    if (!en('en-gifts')) return;
    S.coinsTonight += coins; S.giftsTonight++;
    el('s-coins').textContent = S.coinsTonight.toLocaleString();
    el('s-gifts').textContent = S.giftsTonight;

    S.giftCounts[username] = (S.giftCounts[username]||0) + coins;
    if (S.giftCounts[username] > S.topGifterCoins) {
      S.topGifterCoins = S.giftCounts[username]; S.topGifter = username;
      el('top-gifter').textContent = `${username} (${S.topGifterCoins.toLocaleString()} coins)`;
    }

    // Streaks
    const prev = S.giftStreaks[username];
    if (prev && prev.gift === giftName) { prev.count++; clearTimeout(S.giftStreakTimers[username]); }
    else S.giftStreaks[username] = {gift:giftName, count: repeatCount||1};
    S.giftStreakTimers[username] = setTimeout(() => delete S.giftStreaks[username], 10000);
    const streak = S.giftStreaks[username].count;

    // Goal
    S.giftGoalProgress += coins;
    this.checkGoal(); Settings.updateGoal();

    // Determine size
    const small  = +g('set-small')  || 100;
    const medium = +g('set-medium') || 1000;
    const large  = +g('set-large')  || 5000;
    let size = coins >= large ? 'large' : coins >= medium ? 'medium' : 'small';

    // Get custom sound
    const sound = GiftSounds.pick(giftName, size);

    let msg, priority, opts = {};
    if (size === 'large') {
      msg = streak > 1
        ? `Oh my goodness! ${username} is on a ${streak} times streak of ${giftName}! That is absolutely incredible, thank you so much!`
        : `Oh my goodness! ${username} just sent a ${giftName}! That is an incredible gift, thank you so much!`;
      priority = 1; opts = {pitch:.88, gender:'male', rate: S.speechRate*.9};
      UI.flash('gold'); setTimeout(()=>UI.flash('gold'),350);
    } else if (size === 'medium') {
      msg = streak > 1 ? `${username} is on a ${streak} streak of ${giftName}! Amazing!` : `Wow! ${username} sent a ${giftName}, thank you so much!`;
      priority = 2; opts = {pitch:1.05};
      UI.flash('gold');
    } else {
      msg = streak > 1 ? `${username} is on a ${streak} ${giftName} streak!` : `${username} sent a ${giftName}, thank you!`;
      priority = 4; opts = {pitch:1.0};
    }

    Queue.add(msg,'gift',priority,sound,opts);
    UI.log('gift',username,`${emoji||'🎁'} ${giftName} (${coins.toLocaleString()} coins)${streak>1?` — ${streak}× streak!`:''}`,emoji||'🎁');
  },

  share(username) {
    if (!en('en-shares')) return;
    Queue.add(`${username} just shared your stream — absolute legend, thank you!`,'follow',4,'Gentle Chime',{pitch:1.1});
    UI.log('share',username,'Shared the stream','📤');
  },

  subscribe(username) {
    Queue.add(`${username} just subscribed! Welcome to the family!`,'milestone',3,'Fanfare',{pitch:1.15});
    UI.log('subscribe',username,'New subscriber!','⭐'); UI.flash('gold');
  },

  viewers(count) {
    S.viewers = count;
    if (count > S.peakViewers) { S.peakViewers = count; }
    el('s-viewers').textContent = count;
    [10,25,50,100,250,500,1000].forEach(m => {
      if (count>=m && !S.viewerMilestones.has(m) && en('en-milestones')) {
        S.viewerMilestones.add(m);
        Queue.add(`Incredible! You just hit ${m.toLocaleString()} viewers!`,'milestone',2,'Fanfare',{pitch:1.2});
        UI.log('milestone','System',`${m} viewer milestone!`,'🎉'); UI.flash('green');
      }
    });
  },

  checkGoal() {
    if (S.giftGoal <= 0) return;
    const pct = (S.giftGoalProgress / S.giftGoal) * 100;
    [25,50,75,100].forEach(m => {
      if (pct>=m && !S.goalMilestonesHit.includes(m)) {
        S.goalMilestonesHit.push(m);
        const msg = m===100
          ? `Goal reached! You hit ${S.giftGoal.toLocaleString()} coins tonight! Incredible, thank you all!`
          : `You are now ${m}% toward your gift goal of ${S.giftGoal.toLocaleString()} coins!`;
        Queue.add(msg,'milestone',m===100?1:3,m===100?'Royal Fanfare':'Sparkle');
        if (m===100) { UI.flash('gold'); UI.flash('gold'); }
      }
    });
  }
};

// ══════════════════════════════════════════════════════════════
// LOYALTY
// ══════════════════════════════════════════════════════════════
const Loyalty = {
  data:{},
  tiers:[{visits:50,name:'Legend'},{visits:25,name:'Gold Regular'},{visits:10,name:'Silver Regular'},{visits:3,name:'Bronze Regular'}],
  load() { try { this.data = JSON.parse(localStorage.getItem('tla-loyalty')||'{}'); } catch(_){} },
  save() { localStorage.setItem('tla-loyalty', JSON.stringify(this.data)); },
  check(username, visits) {
    const prev = this.data[username]||0;
    const prevT = this.tiers.find(t=>prev>=t.visits);
    const newT  = this.tiers.find(t=>visits>=t.visits);
    if (newT && (!prevT||newT.name!==prevT.name)) {
      Queue.add(`${username} just became a ${newT.name}! They have been here ${visits} times!`,'milestone',3,'Sparkle');
      UI.log('milestone',username,`Tier: ${newT.name}!`,'🏆');
    }
    this.data[username] = visits; this.save();
  }
};

// ══════════════════════════════════════════════════════════════
// NICKNAMES & KEYWORDS
// ══════════════════════════════════════════════════════════════
const Nicknames = {
  data:{},
  load() { try { this.data = JSON.parse(localStorage.getItem('tla-nicks')||'{}'); } catch(_){} this.render(); },
  add() {
    const u=el('nick-user').value.trim().toLowerCase(), greeting=el('nick-greeting').value.trim();
    if(!u||!greeting) return;
    this.data[u]=greeting; localStorage.setItem('tla-nicks',JSON.stringify(this.data));
    el('nick-user').value=''; el('nick-greeting').value=''; this.render();
  },
  remove(u) { delete this.data[u]; localStorage.setItem('tla-nicks',JSON.stringify(this.data)); this.render(); },
  get(username) { return this.data[username.toLowerCase()]||null; },
  render() { el('nicknames-list').innerHTML=Object.entries(this.data).map(([u,g])=>`<span class="tag" onclick="Nicknames.remove('${u}')">${u}: "${g}" ✕</span>`).join(''); }
};

const Keywords = {
  defaults:{'first time':"Welcome to your first stream, so glad you are here!",'hello':"Hey there, welcome in!",'love you':"Love you too, thank you!",'how are you':"I am doing amazing, thank you for asking!"},
  data:{},
  load() { try { this.data=JSON.parse(localStorage.getItem('tla-kw')||'{}'); } catch(_){} if(!Object.keys(this.data).length) this.data={...this.defaults}; this.render(); },
  add() {
    const t=el('kw-trigger').value.trim().toLowerCase(), r=el('kw-response').value.trim();
    if(!t||!r) return;
    this.data[t]=r; localStorage.setItem('tla-kw',JSON.stringify(this.data));
    el('kw-trigger').value=''; el('kw-response').value=''; this.render();
  },
  remove(t) { delete this.data[t]; localStorage.setItem('tla-kw',JSON.stringify(this.data)); this.render(); },
  check(text) { return this.data[Object.keys(this.data).find(k=>text.includes(k))]||null; },
  render() { el('keywords-list').innerHTML=Object.entries(this.data).map(([t,r])=>`<span class="tag" onclick="Keywords.remove('${t}')">"${t}" → "${r.substring(0,20)}..." ✕</span>`).join(''); }
};

// ══════════════════════════════════════════════════════════════
// GAMES
// ══════════════════════════════════════════════════════════════
const Games = {
  poll() {
    const q=prompt('Poll question:'); if(!q) return;
    S.pollActive=true; S.pollResults={yes:0,no:0};
    Queue.add(`Poll time! ${q} — type YES or NO in chat now!`,'milestone',2,'Sparkle',{pitch:1.1});
    UI.log('game','Game',`Poll: ${q}`,'📊');
    el('game-status').textContent=`Poll active (30s): ${q}`;
    clearTimeout(S.pollTimer);
    S.pollTimer=setTimeout(()=>{
      S.pollActive=false;
      const tot=S.pollResults.yes+S.pollResults.no;
      if(tot){ const yp=Math.round((S.pollResults.yes/tot)*100); Queue.add(`Poll results: ${yp}% said yes and ${100-yp}% said no from ${tot} votes!`,'milestone',2,'Fanfare'); UI.log('game','Game',`Poll: Yes ${yp}% / No ${100-yp}%`,'📊'); }
      else Queue.add('Poll ended with no votes.','system',5);
      el('game-status').textContent=`Poll ended — Yes:${S.pollResults.yes} No:${S.pollResults.no}`;
    },30000);
  },
  firstToType() {
    const w=prompt('What word should they type first?'); if(!w) return;
    S.fttActive=true; S.fttWord=w;
    Queue.add(`Game time! First person to type the word ${w} wins a shoutout!`,'milestone',2,'Sparkle',{pitch:1.1});
    UI.log('game','Game',`First to type: "${w}"`,'⌨');
    el('game-status').textContent=`Waiting for first to type: "${w}"`;
  },
  startGiveaway() {
    S.giveawayActive=true; S.giveawayEntrants=new Set();
    Queue.add('Giveaway mode active! Everyone commenting is automatically entered to win!','milestone',2,'Fanfare',{pitch:1.15});
    UI.log('game','Game','Giveaway started','🎁');
    el('game-status').textContent='Giveaway active — 0 entrants';
    const t=setInterval(()=>{ if(!S.giveawayActive){clearInterval(t);return;} el('game-status').textContent=`Giveaway — ${S.giveawayEntrants.size} entrants`; },2000);
  },
  pickWinner() {
    const ents=[...S.giveawayEntrants]; S.giveawayActive=false;
    if(!ents.length){ Queue.add('No entrants yet — start a giveaway first!','system',4); return; }
    const w=ents[Math.floor(Math.random()*ents.length)];
    Queue.add('Drumroll please...','system',2,'Coin Chime');
    setTimeout(()=>{
      Queue.add(`And the winner is... ${w}! Congratulations! Please get in touch to claim your prize!`,'milestone',1,'Royal Fanfare',{pitch:1.2});
      UI.log('game','Game',`Winner: ${w}`,'🏆'); el('game-status').textContent=`Winner: ${w}`; UI.flash('gold');
    },2500);
  },
  wheel() {
    const raw=prompt('Wheel options separated by commas:'); if(!raw) return;
    const opts=raw.split(',').map(s=>s.trim()).filter(Boolean);
    if(opts.length<2) return;
    Queue.add('The wheel is spinning...','system',3,'Coin Chime');
    el('game-status').textContent='Spinning...';
    let ticks=0;
    const iv=setInterval(()=>{ Audio.event('tick'); ticks++;
      if(ticks>=18){ clearInterval(iv);
        const r=opts[Math.floor(Math.random()*opts.length)];
        setTimeout(()=>{ Queue.add(`The wheel has landed on... ${r}!`,'milestone',1,'Fanfare',{pitch:1.15}); UI.log('game','Game',`Wheel: ${r}`,'🎡'); el('game-status').textContent=`Wheel: ${r}`; },600);
      }
    },110+ticks*10);
  },
  countdown() {
    const mins=+(prompt('Count down from how many minutes?','5')||0);
    if(!mins||isNaN(mins)) return;
    let secs=mins*60;
    Queue.add(`Starting a ${mins} minute countdown!`,'system',3);
    el('game-status').textContent=`Countdown: ${mins}:00`;
    clearInterval(S.countdownTimer);
    const marks=[300,180,120,60,30,10,9,8,7,6,5,4,3,2,1];
    S.countdownTimer=setInterval(()=>{
      secs--;
      const m=Math.floor(secs/60),s=secs%60;
      el('game-status').textContent=`Countdown: ${m}:${String(s).padStart(2,'0')}`;
      if(marks.includes(secs)){
        if(secs>60) Queue.add(`${m} minutes remaining!`,'system',6);
        else if(secs>10) Queue.add(`${secs} seconds remaining!`,'system',4);
        else if(secs>0) Queue.add(`${secs}!`,'system',2,null,{rate:1.5});
        else{ Queue.add('Time is up! Go go go!','milestone',1,'Fanfare',{pitch:1.2}); clearInterval(S.countdownTimer); el('game-status').textContent='Countdown ended'; }
      }
    },1000);
  },
  stop() {
    S.pollActive=S.fttActive=S.giveawayActive=false;
    clearTimeout(S.pollTimer); clearInterval(S.countdownTimer);
    el('game-status').textContent='All games stopped';
    Queue.add('All games have been stopped.','system',5);
  }
};

// ══════════════════════════════════════════════════════════════
// REMINDERS
// ══════════════════════════════════════════════════════════════
const Reminders = {
  start() {
    this.stop();
    if (!en('en-reminders')) return;
    const add=(fn,mins)=>{ S.reminderIntervals.push(setInterval(fn,mins*60000)); };
    add(()=>Queue.add("Hey, have you had some water? Take a quick sip!",'system',7,null,{volume:.7}),+g('set-water')||20);
    add(()=>Queue.add("Don't forget to ask viewers to hit that follow button!",'system',7,null,{volume:.7}),+g('set-follow-nudge')||15);
    add(()=>Queue.add("Good time to mention your other social media!",'system',7,null,{volume:.7}),+g('set-socials')||25);
    add(()=>Queue.add("Quick posture check! Sit up straight and take a breath.",'system',8,null,{volume:.6}),+g('set-posture')||45);
    add(()=>{ Queue.add(`Stats update: ${S.viewers} people watching, ${S.followsTonight} follows, ${S.coinsTonight.toLocaleString()} coins tonight.`,'system',6); },+g('set-viewers-timer')||5);
    add(()=>Queue.add(`Earnings so far tonight: ${S.coinsTonight.toLocaleString()} coins.${S.topGifter?` Top gifter is ${S.topGifter}.`:''}`,'system',6),+g('set-earnings')||10);
    S.reminderIntervals.push(setInterval(()=>{ const m=Math.floor(S.streamDuration/60),h=Math.floor(m/60),min=m%60; const dur=h>0?`${h} hour${h>1?'s':''} and ${min} minutes`:`${m} minutes`; Queue.add(`You have been live for ${dur}.`,'system',8,null,{volume:.6}); },30*60000));
  },
  stop() { S.reminderIntervals.forEach(clearInterval); S.reminderIntervals=[]; }
};

// ══════════════════════════════════════════════════════════════
// VOICE COMMANDS
// ══════════════════════════════════════════════════════════════
const VoiceCmd = {
  rec:null,
  init() {
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ alert('Voice commands need Chrome or Edge.'); return false; }
    this.rec=new SR(); this.rec.continuous=true; this.rec.interimResults=false; this.rec.lang='en-GB';
    this.rec.onresult=e=>{ const t=e.results[e.results.length-1][0].transcript.toLowerCase().trim(); this.handle(t); };
    this.rec.onerror=e=>{ if(e.error!=='no-speech'){ S.vcEnabled=false; el('vc-toggle').checked=false; UI.updateVoice(); } };
    this.rec.onend=()=>{ if(S.vcEnabled){ try{this.rec.start();}catch(_){} } };
    return true;
  },
  start() { if(!this.rec&&!this.init()) return; try{this.rec.start();}catch(_){} UI.updateVoice(); },
  stop()  { try{this.rec&&this.rec.stop();}catch(_){} UI.updateVoice(); },
  handle(text) {
    const wake=(g('set-wakeword')||'hey stream').toLowerCase();
    if(!text.includes(wake)) return;
    const cmd=text.replace(new RegExp(wake,'g'),'').trim();
    UI.log('system','Voice Cmd',cmd,'🎤');
    if     (cmd.includes('skip'))      App.skip();
    else if(cmd.includes('repeat'))    App.repeatLast();
    else if(cmd.includes('unmute'))    { if(S.isMuted) App.toggleMute(); }
    else if(cmd.includes('mute'))      App.toggleMute();
    else if(cmd.includes('how long'))  { const m=Math.floor(S.streamDuration/60); Queue.add(`You have been live for ${m} minutes.`,'system',2); }
    else if(cmd.includes('stats'))     App.readStats();
    else if(cmd.includes('qa mode')||cmd.includes('q and a')) App.setQA(!S.qaMode);
    else if(cmd.includes('water'))     App.waterBreak();
    else if(cmd.includes('panic'))     App.panic();
    else if(cmd.includes('slow down')) App.setRate(Math.max(.5,S.speechRate-.25));
    else if(cmd.includes('speed up'))  App.setRate(Math.min(2.5,S.speechRate+.25));
    else if(cmd.includes('earnings'))  Queue.add(`You have earned ${S.coinsTonight.toLocaleString()} coins tonight.`,'system',2);
    else if(cmd.includes('top gifter'))Queue.add(S.topGifter?`Top gifter is ${S.topGifter} with ${S.topGifterCoins.toLocaleString()} coins.`:'No gifts yet.','system',2);
    else if(cmd.includes('good night'))App.endStream();
    else if(cmd.startsWith('shoutout')){ const name=cmd.replace('shoutout','').trim(); if(name) Queue.add(`Shoutout to the amazing ${name}! Go show them some love!`,'milestone',2,'Sparkle',{pitch:1.1}); }
  }
};

// ══════════════════════════════════════════════════════════════
// SIMULATION
// ══════════════════════════════════════════════════════════════
const Sim = {
  timers:[],
  toggle() { S.isSimulating ? this.stop() : this.start(); },
  start() {
    S.isSimulating=true;
    el('sim-btn').textContent='⏹ STOP SIMULATION'; el('sim-btn').classList.add('running');
    el('sim-badge').classList.remove('hidden');
    App.goLive();
    let v=20;
    this.timers.push(setInterval(()=>{ v=Math.max(5,Math.min(800,v+Math.floor(Math.random()*9)-3)); Events.viewers(v); },5000));
    this.timers.push(setInterval(()=>{ Events.comment(rand(FAKE_USERS),rand(FAKE_COMMENTS)); },3500+Math.random()*3500));
    this.timers.push(setInterval(()=>{ Events.follow(rand(FAKE_USERS)+Math.floor(Math.random()*99)); },12000+Math.random()*18000));
    this.timers.push(setInterval(()=>{ Events.share(rand(FAKE_USERS)); },35000+Math.random()*30000));
    this.timers.push(setInterval(()=>{ const g=FAKE_GIFTS[Math.floor(Math.random()*5)]; Events.gift(rand(FAKE_USERS),g.n,g.c,g.e,1); },18000+Math.random()*20000));
    this.timers.push(setInterval(()=>{ const g=FAKE_GIFTS[5+Math.floor(Math.random()*3)]; Events.gift(rand(FAKE_USERS),g.n,g.c,g.e,1); },55000+Math.random()*55000));
    this.timers.push(setInterval(()=>{ const g=FAKE_GIFTS[9+Math.floor(Math.random()*3)]; Events.gift(rand(FAKE_USERS),g.n,g.c,g.e,1); },150000+Math.random()*120000));
  },
  stop() {
    S.isSimulating=false; this.timers.forEach(clearInterval); this.timers=[];
    el('sim-btn').textContent='▶ START SIMULATION'; el('sim-btn').classList.remove('running');
    el('sim-badge').classList.add('hidden');
  }
};

// ══════════════════════════════════════════════════════════════
// TIKTOK CONNECTION
// ══════════════════════════════════════════════════════════════
const TikTok = {
  toggleConnect() {
    if (S.tiktokConnected) { socket.emit('disconnect-tiktok'); return; }
    this.showModal();
  },
  showModal() {
    el('tiktok-modal').classList.remove('hidden');
    el('modal-error').textContent = '';
    el('tiktok-username-input').value = '';
    setTimeout(() => el('tiktok-username-input').focus(), 100);
    el('tiktok-username-input').onkeydown = e => { if(e.key==='Enter') TikTok.connect(); };
  },
  connect() {
    const username = el('tiktok-username-input').value.trim();
    if (!username) return;
    el('modal-error').textContent = 'Connecting...';
    socket.emit('connect-tiktok', { username });
  },
  closeModal() { el('tiktok-modal').classList.add('hidden'); }
};

socket.on('tiktok-connecting', ({username}) => {
  Speech.speak(`Connecting to ${username}'s live stream. Please wait.`);
  UI.log('system','TikTok',`Connecting to @${username}...`,'🔄');
});
socket.on('tiktok-connected', ({username}) => {
  S.tiktokConnected=true;
  TikTok.closeModal();
  el('btn-connect').textContent='🔴 DISCONNECT'; el('btn-connect').classList.add('live');
  App.goLive();
  Queue.add(`Connected to ${username}'s TikTok live stream!`,'system',2,'Fanfare');
  UI.log('system','TikTok',`Connected to @${username}`,'✅');
  el('live-dot').classList.add('on'); el('live-label').textContent='LIVE';
});
socket.on('tiktok-disconnected', ({reason}) => {
  S.tiktokConnected=false;
  el('btn-connect').textContent='🔴 CONNECT TO TIKTOK'; el('btn-connect').classList.remove('live');
  Queue.add(`Disconnected from TikTok. ${reason}`,'alert',2,'Alert Beep');
  UI.log('alert','TikTok',`Disconnected: ${reason}`,'❌');
});
socket.on('tiktok-error', ({message}) => {
  el('modal-error').textContent = message;
  UI.log('alert','TikTok',`Error: ${message}`,'⚠');
});
socket.on('event', data => {
  switch(data.type){
    case 'comment':      Events.comment(data.username,data.text); break;
    case 'gift':         Events.gift(data.username,data.giftName,data.coins,data.emoji,data.repeatCount); break;
    case 'follow':       Events.follow(data.username); break;
    case 'share':        Events.share(data.username); break;
    case 'subscribe':    Events.subscribe(data.username); break;
    case 'viewer_count': Events.viewers(data.count); break;
  }
});

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
const App = {
  goLive() {
    if (S.isLive) return;
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
  preStreamChecklist() {
    Queue.add("Quick pre-stream check. Make sure your mic is on. Water nearby. Battery charged. You are ready. Have an amazing stream!",'system',10,null,{rate:.92});
    UI.log('system','System','✅ Pre-stream check','✅');
  },
  toggleMute() {
    S.isMuted=!S.isMuted;
    if(S.isMuted){ Speech.cancel(); Queue.clear(); el('mute-btn').textContent='🔇 MUTED — TAP TO UNMUTE'; el('mute-btn').classList.add('muted'); }
    else { el('mute-btn').textContent='🔊 UNMUTED'; el('mute-btn').classList.remove('muted'); }
  },
  setRate(val) { S.speechRate=parseFloat(val); el('rate-slider').value=val; el('rate-val').textContent=parseFloat(val).toFixed(1)+'×'; Settings.save(); },
  setVolume(val) { S.voiceVolume=val/100; el('vol-slider').value=val; el('vol-val').textContent=Math.round(val)+'%'; Settings.save(); },
  setSfxVolume(val) { S.sfxVolume=val/100; el('sfx-slider').value=val; el('sfx-val').textContent=Math.round(val)+'%'; },
  setQA(val) { S.qaMode=val; el('qa-toggle').checked=val; Queue.add(val?'Q and A mode on. Only questions announced.':'Q and A mode off.','system',3); },
  setSafe(val) { S.safeMode=val; Queue.add(val?'Safe mode on. Only gifts and follows.':'Safe mode off.','system',3); },
  setCalm(val) { S.calmMode=val; el('calm-toggle').checked=val; Queue.add(val?'Calm mode on.':'Calm mode off.','system',3); },
  setToxic(val) { S.toxicFilter=val; },
  setBleep(val) { S.bleepProfanity=val; },
  setVoiceCommands(val) {
    S.vcEnabled=val;
    if(val){ VoiceCmd.start(); Queue.add(`Voice commands active. Say ${g('set-wakeword')||'hey stream'} followed by your command.`,'system',3); }
    else VoiceCmd.stop();
  },
  skip() { Speech.cancel(); S.isAnnouncing=false; setTimeout(()=>Queue.next(),100); },
  repeatLast() { if(S.lastText) Queue.add(S.lastText,S.lastType,2); },
  readStats() {
    const m=Math.floor(S.streamDuration/60);
    Queue.add(`Stats: ${S.viewers} viewers, ${S.followsTonight} follows tonight, ${S.coinsTonight.toLocaleString()} coins earned, live for ${m} minutes.${S.topGifter?` Top gifter: ${S.topGifter}.`:''}`,'system',2);
  },
  waterBreak() {
    Queue.clear();
    Queue.add("Taking a quick water break — back in a moment chat!",'system',1,null,{volume:.9});
    UI.log('system','System','💧 Water break','💧');
    setTimeout(()=>{ if(!S.isMuted) Queue.add('Water break over — back and ready to go!','system',1); },5*60000);
  },
  panic() {
    Queue.clear(); S.isMuted=false;
    Audio.event('panic');
    Speech.speak('Stream paused safely. You are okay. Take your time. Everything is fine. Breathe.',{rate:.82,pitch:.9,volume:1.0,
      onend:()=>{ S.isMuted=true; el('mute-btn').textContent='🔇 MUTED — TAP TO UNMUTE'; el('mute-btn').classList.add('muted'); }});
    UI.log('alert','PANIC','⚠ Panic — muted','🚨'); UI.flash('red');
  },
  endStream() {
    if(!confirm('End stream and hear your summary?')) return;
    Sim.stop(); Reminders.stop(); S.isLive=false; clearInterval(S.streamInterval);
    Queue.clear();
    const m=Math.floor(S.streamDuration/60),h=Math.floor(m/60),mins=m%60;
    const dur=h>0?`${h} hour${h>1?'s':''} and ${mins} minutes`:`${m} minutes`;
    const summary=`Tonight was a fantastic stream. Here is your summary. You were live for ${dur}. You gained ${S.followsTonight} new followers. You earned approximately ${S.coinsTonight.toLocaleString()} coins. ${S.topGifter?`Top gifter was ${S.topGifter} with ${S.topGifterCoins.toLocaleString()} coins. `:''}${S.topCommenter?`Most active chatter was ${S.topCommenter}. `:''}Peak viewers was ${S.peakViewers}. You did an incredible job. Rest up and see you next time.`;
    Speech.speak(summary,{rate:.9,volume:1.0});
    UI.log('system','Ended',summary,'🔴');
    el('live-dot').classList.remove('on'); el('live-label').textContent='ENDED';
    el('btn-connect').textContent='🔴 CONNECT TO TIKTOK'; el('btn-connect').classList.remove('live');
    if(S.tiktokConnected) socket.emit('disconnect-tiktok');
  },
  handleKey(e) {
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
    switch(e.key.toLowerCase()){
      case 'm': this.toggleMute(); break;
      case 's': this.skip(); break;
      case 'r': this.repeatLast(); break;
      case 'p': this.panic(); break;
      case 'q': this.setQA(!S.qaMode); break;
      case 'c': { const nv=!S.calmMode; el('calm-toggle').checked=nv; this.setCalm(nv); break; }
      case '-': this.setRate(Math.max(.5,S.speechRate-.1)); break;
      case '+': case '=': this.setRate(Math.min(2.5,S.speechRate+.1)); break;
    }
  }
};

// ══════════════════════════════════════════════════════════════
// TEST BUTTONS
// ══════════════════════════════════════════════════════════════
const Test = {
  comment()     { Events.comment(rand(FAKE_USERS),rand(FAKE_COMMENTS)); },
  question()    { Events.comment(rand(FAKE_USERS),'What headset do you use for streaming?'); },
  giftSmall()   { const g=FAKE_GIFTS[2]; Events.gift('TestFan',g.n,g.c,g.e,1); },
  giftMedium()  { const g=FAKE_GIFTS[7]; Events.gift('TestFan',g.n,g.c,g.e,1); },
  giftLarge()   { const g=FAKE_GIFTS[10]; Events.gift('VIPFan',g.n,g.c,g.e,1); },
  follow()      { Events.follow('NewFan'+Math.floor(Math.random()*99)); },
  share()       { Events.share('ShareLegend'); },
  milestone()   { Events.viewers(100); },
  alert()       { Queue.add('Warning! This is a test alert.','alert',1,'Alert Beep',{pitch:.85}); UI.log('alert','System','Alert test','⚠'); },
  streak()      { [1,2,3].forEach((_,i)=>setTimeout(()=>Events.gift('StreakFan','Rose',1,'🌹',i+1),i*400)); },
  returnViewer(){ S.viewerHistory['OldFriend']={visits:5,lastSeen:Date.now()-86400000}; Events.follow('OldFriend'); }
};

// ══════════════════════════════════════════════════════════════
// UI
// ══════════════════════════════════════════════════════════════
const UI = {
  log(type, username, text, icon) {
    const c=el('log-container');
    const t=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const d=document.createElement('div');
    d.className='log-entry flash';
    d.innerHTML=`<span class="log-time">${t}</span><span class="log-badge ${type}">${type}</span><span class="log-text"><span class="un">${esc(username)}</span> — ${esc(text)}</span>`;
    c.appendChild(d);
    c.scrollTop=c.scrollHeight;
    setTimeout(()=>d.classList.remove('flash'),500);
  },
  clearLog() { el('log-container').innerHTML=''; },
  setNP(item) {
    el('np-type').textContent=item.type.toUpperCase();
    el('np-type').className='now-tag '+item.type;
    el('np-text').textContent=item.text;
    const bar=el('np-bar');
    bar.style.transition='none'; bar.style.width='100%';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ bar.style.transition='width 4s linear'; bar.style.width='0%'; }));
  },
  clearNP() {
    el('np-type').textContent='IDLE'; el('np-type').className='now-tag';
    el('np-text').textContent='Waiting for events...'; el('np-bar').style.width='0%';
  },
  updateQueue() {
    const n=S.queue.length;
    el('queue-count').textContent=n;
    el('queue-preview').textContent=n>0?`Next: ${S.queue[0].text.slice(0,40)}…`:'';
  },
  updateVoice() {
    el('voice-dot').className='voice-dot'+(S.vcEnabled?' on':'');
    el('voice-label').textContent=S.vcEnabled?'MIC ON':'MIC OFF';
  },
  flash(color) {
    const o=el('flash-overlay');
    o.className=`flash-overlay ${color} show`;
    setTimeout(()=>o.classList.remove('show'),700);
  }
};

// ══════════════════════════════════════════════════════════════
// WIZARD
// ══════════════════════════════════════════════════════════════
const Wizard = {
  step:0, ans:{},
  steps:[
    {id:'name', type:'text', q:"Welcome to TikTok Live Announcer — built for accessibility. First, what is your streamer name?", placeholder:'Your name', def:'Streamer'},
    {id:'rate', type:'opts', q:"How fast would you like announcements to be read?", opts:[{l:'Slow',v:.8},{l:'Normal',v:1.0},{l:'Fast',v:1.2},{l:'Very Fast',v:1.5}], def:1.0},
    {id:'toxic',type:'opts', q:"Should we automatically skip any abusive or hateful comments so you never hear them?", opts:[{l:'Yes — protect me',v:true},{l:'No — read everything',v:false}], def:true},
    {id:'goal', type:'text', q:"What is your coin goal for tonight? Enter a number, or 0 for no goal.", placeholder:'e.g. 5000', def:'1000'},
    {id:'vc',   type:'opts', q:"Would you like to control the app with your voice? You can say things like hey stream skip or hey stream mute. Needs Chrome or Edge.", opts:[{l:'Yes please',v:true},{l:'No thanks',v:false}], def:false},
    {id:'done', type:'finish',q:"All done! Your announcer is ready. Press Start Simulation to test everything, or Connect to TikTok when you are live."}
  ],
  start() {
    el('app').classList.add('hidden'); el('wizard').classList.remove('hidden');
    this.step=0; this.ans={}; this.render();
  },
  render() {
    const s=this.steps[this.step], total=this.steps.length;
    el('wiz-dots').innerHTML=Array.from({length:total},(_,i)=>`<div class="wiz-dot${i<=this.step?' on':''}"></div>`).join('');
    el('wiz-step').textContent=`Step ${this.step+1} of ${total}`;
    setTimeout(()=>{ Speech.speak(s.q,{rate:1.0,volume:1.0}); el('wiz-speaking').textContent='🔊 Speaking...'; setTimeout(()=>el('wiz-speaking').textContent='',3500); },200);
    const c=el('wiz-content');
    c.innerHTML=`<p class="wiz-text">${s.q}</p>`;
    if(s.type==='text'){
      c.innerHTML+=`<input type="text" class="wiz-inp" id="wiz-inp" placeholder="${s.placeholder}" value="${s.def||''}"><button class="wiz-btn" onclick="Wizard.next()">Next →</button>`;
      setTimeout(()=>document.getElementById('wiz-inp')?.focus(),100);
      setTimeout(()=>{ document.getElementById('wiz-inp')?.addEventListener('keydown',e=>{if(e.key==='Enter')Wizard.next();}); },150);
    } else if(s.type==='opts'){
      c.innerHTML+=`<div class="wiz-opts">${s.opts.map(o=>`<button class="wiz-opt" data-val='${JSON.stringify(o.v)}' onclick="Wizard.pick(this,'${s.id}',this.dataset.val)">${o.l}</button>`).join('')}</div><button class="wiz-btn" onclick="Wizard.next()">Next →</button>`;
      const def=s.opts.find(o=>o.v===s.def);
      if(def) setTimeout(()=>{ document.querySelectorAll('.wiz-opt').forEach(b=>{if(b.textContent===def.l){b.classList.add('on');this.ans[s.id]=s.def;}}); },50);
    } else if(s.type==='finish'){
      c.innerHTML+=`<button class="wiz-btn" onclick="Wizard.finish()">🚀 Launch Announcer!</button>`;
    }
  },
  pick(el,id,valStr) {
    document.querySelectorAll('.wiz-opt').forEach(b=>b.classList.remove('on'));
    el.classList.add('on');
    try{this.ans[id]=JSON.parse(valStr);}catch(_){this.ans[id]=valStr;}
  },
  next() {
    const s=this.steps[this.step];
    if(s.type==='text'){ const inp=document.getElementById('wiz-inp'); this.ans[s.id]=(inp?inp.value.trim():'')||s.def; }
    this.step++;
    if(this.step>=this.steps.length){this.finish();return;}
    this.render();
  },
  finish() {
    const a=this.ans;
    if(a.name) el('set-name').value=a.name;
    if(a.rate) App.setRate(a.rate);
    if(a.toxic!==undefined){S.toxicFilter=a.toxic;el('toxic-toggle').checked=a.toxic;}
    if(a.goal){el('set-goal').value=a.goal;Settings.saveGoal();}
    Settings.save();
    localStorage.setItem('tla-wizard','done');
    el('wizard').classList.add('hidden'); el('app').classList.remove('hidden');
    setTimeout(()=>{
      Speech.speak(`Welcome ${a.name||'Streamer'}! Your announcer is all set up and ready to go. Press Start Simulation to test everything out. When you go live on TikTok press Connect to TikTok and enter your username. Enjoy your stream!`,{rate:S.speechRate,volume:1.0});
      UI.log('system','System','🟢 Announcer ready!','🟢');
      if(a.vc) setTimeout(()=>{el('vc-toggle').checked=true;App.setVoiceCommands(true);},4000);
    },300);
  }
};

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════
function el(id){return document.getElementById(id);}
function g(id){return el(id)?.value||'';}
function en(id){return el(id)?.checked!==false;}
function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
function esc(str){return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  Speech.load();
  if(speechSynthesis.onvoiceschanged!==undefined) speechSynthesis.onvoiceschanged=()=>Speech.load();
  document.addEventListener('keydown',e=>App.handleKey(e));
  Settings.load();

  // Battery
  if(navigator.getBattery){
    navigator.getBattery().then(bat=>{
      const check=()=>{ if(bat.level<.2&&!bat.charging) Queue.add(`Battery warning! You are at ${Math.round(bat.level*100)}%. Please plug in soon.`,'alert',2,'Alert Beep'); };
      bat.addEventListener('levelchange',check);
      setInterval(check,5*60000);
    });
  }

  if(!localStorage.getItem('tla-wizard')){
    Wizard.start();
  } else {
    el('wizard').classList.add('hidden'); el('app').classList.remove('hidden');
    setTimeout(()=>{
      Speech.speak('TikTok Live Announcer is ready. Press Start Simulation to test, or Connect to TikTok to go live.',{rate:S.speechRate,volume:1.0});
      UI.log('system','System','🟢 Ready!','🟢');
    },500);
  }
});
