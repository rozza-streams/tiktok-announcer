/* ════════════════════════════════════════════════════════════
   TIKTOK LIVE ANNOUNCER — CLIENT APP
   Complete accessibility-first announcer engine
════════════════════════════════════════════════════════════ */

'use strict';

// ── SOCKET.IO CONNECTION ────────────────────────────────────
const socket = io();

// ── CONSTANTS ───────────────────────────────────────────────
const FAKE_USERS = ['StarGazer99','MikeyMike','LunaLove','TechWizard','SarahSunshine',
  'DarkKnight88','PinkPanda','GameOn2024','CoolCat777','VibeCheck','NightOwl',
  'FlipFlop','MoonChild','ElectricDave','CherryBlossom','TigerKing2','BlueSky22',
  'GeminiRose','SilverFox','NeonLights'];

const GIFTS = [
  {n:'Rose',c:1,e:'🌹'},{n:'TikTok',c:5,e:'🎵'},{n:'Sunglasses',c:5,e:'🕶'},
  {n:'Soccer',c:10,e:'⚽'},{n:'Ice Cream',c:20,e:'🍦'},{n:'Crown',c:50,e:'👑'},
  {n:'Rocket',c:100,e:'🚀'},{n:'Diamond',c:200,e:'💎'},{n:'Dragon',c:500,e:'🐉'},
  {n:'Lion',c:1000,e:'🦁'},{n:'Universe',c:5000,e:'🌌'},{n:'Galaxy',c:10000,e:'🌠'}
];

const COMMENTS = [
  'love your stream!','hello there!','first time here, love it!',
  'this is amazing content','you are so talented','been here for ages now',
  'keep it up, you are great','you are the best streamer','say hi to me please',
  'what headset do you use?','how long have you been streaming?',
  'love the energy today','giving you a follow right now','so entertaining tonight',
  'you make my day every stream','can you do a shoutout please?','incredible content',
  'love from the UK','never miss a stream','you deserve way more followers'
];

const TOXIC_WORDS = ['hate','stupid','idiot','ugly','kill yourself','die','loser','moron'];
const PROFANITY   = ['damn','crap','hell','ass','bloody','crap'];

// ── STATE ────────────────────────────────────────────────────
const S = {
  // connection
  isLive: false, isMuted: false, isSimulating: false,
  tiktokConnected: false, tiktokUsername: '',
  // stream
  startTime: null, streamDuration: 0, streamInterval: null,
  // stats
  viewers: 0, peakViewers: 0,
  followsTonight: 0, coinsTonight: 0, giftsTonight: 0, commentsTonight: 0,
  topGifter: '', topGifterCoins: 0, topCommenter: '', topCommenterCount: 0,
  giftGoal: 1000, giftGoalProgress: 0, goalMilestonesHit: [],
  // modes
  qaMode: false, safeMode: false, calmMode: false,
  toxicFilter: true, bleepProfanity: false, vcEnabled: false,
  // audio
  speechRate: 1.0, voiceVolume: 1.0, sfxVolume: 0.8,
  // queue
  queue: [], isAnnouncing: false,
  lastText: '', lastType: 'system',
  // tracking
  spamTracker: {}, viewerHistory: {},
  giftStreaks: {}, giftStreakTimers: {},
  giftCounts: {}, commentCounts: {},
  viewerMilestones: new Set(), followMilestones: new Set(),
  activitySpike: [], silenceTimer: null,
  firstCommentDone: false,
  // games
  pollActive: false, pollResults: { yes:0, no:0 }, pollTimer: null,
  fttActive: false, fttWord: '',
  giveawayActive: false, giveawayEntrants: new Set(),
  countdownTimer: null,
  // audio context
  audioCtx: null,
  // reminders
  reminderIntervals: []
};

// ══════════════════════════════════════════════════════════════
// AUDIO ENGINE
// ══════════════════════════════════════════════════════════════
const Audio = {
  init() {
    if (!S.audioCtx) {
      S.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (S.audioCtx.state === 'suspended') S.audioCtx.resume();
  },
  play(type) {
    try {
      this.init();
      if (S.sfxVolume === 0) return;
      const ctx = S.audioCtx;
      const master = ctx.createGain();
      master.gain.setValueAtTime(S.sfxVolume * 0.28, ctx.currentTime);
      master.connect(ctx.destination);

      const plays = {
        comment:    [[440,0,.08,'sine',.07]],
        question:   [[440,0,.05,'sine',.05],[554,.05,.12,'sine',.05]],
        follow:     [[523,0,.12,'sine',.1],[659,.1,.2,'sine',.08]],
        share:      [[392,0,.08,'sine',.07],[523,.06,.14,'sine',.06]],
        gift_small: [[440,0,.06,'sine',.06],[554,.05,.12,'sine',.05]],
        gift_med:   [[523,0,.08,'triangle',.07],[659,.07,.15,'triangle',.07],[784,.13,.22,'triangle',.05]],
        gift_large: [[261,0,.1,'square',.04],[392,0,.15,'sine',.08],[523,.08,.18,'sine',.1],
                     [659,.16,.26,'sine',.1],[784,.24,.36,'sine',.09],[1047,.32,.52,'sine',.12]],
        milestone:  [[523,0,.1,'sine',.09],[659,.09,.18,'sine',.09],
                     [784,.17,.27,'sine',.09],[1047,.25,.42,'sine',.1]],
        alert:      [[880,0,.15,'square',.05],[880,.18,.33,'square',.05]],
        panic:      [[220,0,.2,'square',.04],[165,.2,.4,'square',.04]],
        tick:       [[600,0,.04,'sine',.06]]
      };

      (plays[type] || plays.comment).forEach(([freq, start, end, wave, g]) => {
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
  }
};

// ══════════════════════════════════════════════════════════════
// SPEECH ENGINE
// ══════════════════════════════════════════════════════════════
const Speech = {
  voices: [],
  ready: false,
  load() {
    const v = speechSynthesis.getVoices();
    if (v.length) { this.voices = v; this.ready = true; }
  },
  getVoice(gender) {
    const en = this.voices.filter(v => v.lang && v.lang.startsWith('en'));
    if (!en.length) return null;
    if (gender === 'female')
      return en.find(v => /female|woman|zira|salli|joanna|samantha|victoria|karen|moira|fiona/i.test(v.name)) || en[0];
    if (gender === 'male')
      return en.find(v => /male|man|david|mark|alex|daniel|james|ryan|george/i.test(v.name)) || en[1] || en[0];
    return en[0];
  },
  speak(text, opts = {}) {
    if (!window.speechSynthesis) return null;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate   = opts.rate   !== undefined ? opts.rate   : S.speechRate;
    utt.pitch  = opts.pitch  !== undefined ? opts.pitch  : 1.0;
    utt.volume = opts.volume !== undefined ? opts.volume : S.voiceVolume;
    const voice = this.getVoice(opts.gender);
    if (voice) utt.voice = voice;
    if (opts.onend) utt.onend = opts.onend;
    utt.onerror = () => { if (opts.onend) opts.onend(); };
    speechSynthesis.speak(utt);
    return utt;
  },
  cancel() { speechSynthesis.cancel(); }
};

// ══════════════════════════════════════════════════════════════
// QUEUE ENGINE
// ══════════════════════════════════════════════════════════════
const Queue = {
  add(text, type = 'system', priority = 5, earcon = null, opts = {}) {
    if (S.isMuted && priority > 1) return;
    if (S.calmMode && priority > 3) {
      // in calm mode skip low-priority duplicates
      if (S.queue.some(i => i.type === type)) return;
    }
    const item = { text, type, priority, earcon, opts, id: Date.now() + Math.random() };
    // Insert by priority (lower number = higher priority)
    let idx = S.queue.findIndex(i => i.priority > priority);
    if (idx === -1) S.queue.push(item);
    else            S.queue.splice(idx, 0, item);
    // Cap queue in calm mode
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
    if (item.earcon) {
      Audio.play(item.earcon);
      setTimeout(() => this._speak(item), 320);
    } else {
      this._speak(item);
    }
  },
  _speak(item) {
    const o = Object.assign({ rate: S.speechRate, volume: S.voiceVolume }, item.opts);
    o.onend = () => { S.isAnnouncing = false; setTimeout(() => this.next(), 120); };
    Speech.speak(item.text, o);
  },
  clear() {
    S.queue = []; Speech.cancel();
    S.isAnnouncing = false;
    UI.updateQueue(); UI.clearNP();
  }
};

// ══════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════
const Settings = {
  load() {
    try {
      const raw = localStorage.getItem('tla-v2');
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.name)        document.getElementById('set-name').value = d.name;
      if (d.wakeWord)    document.getElementById('set-wakeword').value = d.wakeWord;
      if (d.water)       document.getElementById('set-water').value = d.water;
      if (d.followNudge) document.getElementById('set-follow-nudge').value = d.followNudge;
      if (d.socials)     document.getElementById('set-socials').value = d.socials;
      if (d.posture)     document.getElementById('set-posture').value = d.posture;
      if (d.viewerT)     document.getElementById('set-viewers-timer').value = d.viewerT;
      if (d.earnings)    document.getElementById('set-earnings').value = d.earnings;
      if (d.goal)        { document.getElementById('set-goal').value = d.goal; S.giftGoal = +d.goal; }
      if (d.small)       document.getElementById('set-small').value = d.small;
      if (d.medium)      document.getElementById('set-medium').value = d.medium;
      if (d.large)       document.getElementById('set-large').value = d.large;
      if (d.rate)        App.setRate(d.rate);
      if (d.vol !== undefined) App.setVolume(d.vol * 100);
    } catch(_) {}
    Nicknames.load(); Keywords.load(); Loyalty.load();
    this.updateGoal();
  },
  save() {
    const d = {
      name:       g('set-name'),
      wakeWord:   g('set-wakeword'),
      water:      +g('set-water'),
      followNudge:+g('set-follow-nudge'),
      socials:    +g('set-socials'),
      posture:    +g('set-posture'),
      viewerT:    +g('set-viewers-timer'),
      earnings:   +g('set-earnings'),
      goal:       +g('set-goal'),
      small:      +g('set-small'),
      medium:     +g('set-medium'),
      large:      +g('set-large'),
      rate: S.speechRate, vol: S.voiceVolume
    };
    localStorage.setItem('tla-v2', JSON.stringify(d));
  },
  saveGoal() {
    S.giftGoal = +g('set-goal') || 1000;
    this.save(); this.updateGoal();
  },
  updateGoal() {
    if (S.giftGoal <= 0) {
      el('goal-label').textContent = 'Set a goal in Settings';
      el('goal-pct').textContent = '';
      el('goal-fill').style.width = '0%';
      return;
    }
    const pct = Math.min(100, Math.round((S.giftGoalProgress / S.giftGoal) * 100));
    el('goal-label').textContent = `${S.giftGoalProgress.toLocaleString()} / ${S.giftGoal.toLocaleString()} coins`;
    el('goal-fill').style.width = pct + '%';
    el('goal-pct').textContent = pct + '% of goal';
  },
  reset() {
    if (!confirm('Reset ALL settings to defaults?')) return;
    localStorage.removeItem('tla-v2');
    localStorage.removeItem('tla-wizard');
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

    // Toxic filter
    if (S.toxicFilter) {
      if (TOXIC_WORDS.some(w => text.toLowerCase().includes(w))) {
        UI.log('system', username, 'Skipped: inappropriate comment', '🚫');
        return;
      }
    }

    // Profanity bleep
    let clean = text;
    if (S.bleepProfanity) {
      PROFANITY.forEach(w => { clean = clean.replace(new RegExp(w,'gi'), '****'); });
    }

    // Spam filter
    const key = clean.toLowerCase().trim().slice(0, 40);
    S.spamTracker[key] = (S.spamTracker[key] || 0) + 1;
    if (S.spamTracker[key] > 3) return;
    setTimeout(() => delete S.spamTracker[key], 25000);

    // Top commenter tracking
    S.commentCounts[username] = (S.commentCounts[username] || 0) + 1;
    if (S.commentCounts[username] > S.topCommenterCount) {
      S.topCommenterCount = S.commentCounts[username];
      S.topCommenter = username;
      el('top-commenter-display').textContent = `${username} (${S.topCommenterCount})`;
    }

    // Reset silence timer
    clearTimeout(S.silenceTimer);
    S.silenceTimer = setTimeout(() => {
      Queue.add('Chat has gone quiet — good time to ask your audience a question!', 'system', 7);
    }, 60000);

    // Keyword triggers
    const lower = clean.toLowerCase();
    const kwReply = Keywords.check(lower);
    if (kwReply) {
      Queue.add(kwReply, 'comment', 5, 'comment', { pitch: 1.1 });
      UI.log('comment', username, text, '💬');
      return;
    }

    // Custom nickname
    const nick = Nicknames.get(username);
    if (nick) {
      Queue.add(nick, 'comment', 4, 'comment', { pitch: 1.1 });
      UI.log('comment', username, text, '👋');
      return;
    }

    // First comment of stream
    if (!S.firstCommentDone) {
      S.firstCommentDone = true;
      Queue.add(`First comment tonight goes to ${username} — they say: ${clean}`, 'milestone', 2, 'milestone', { pitch: 1.15 });
      UI.log('milestone', username, `FIRST COMMENT: ${text}`, '⭐');
      UI.flash('green'); return;
    }

    // Question
    if (clean.includes('?') && en('en-questions')) {
      if (!S.safeMode) {
        Queue.add(`Question from ${username}: ${clean}`, 'question', 3, 'question', { pitch: 1.12, gender: 'female' });
        UI.log('question', username, text, '❓');
      }
      return;
    }

    // Shoutout request
    if (/\bso\b/.test(lower) || lower.includes('shoutout')) {
      Queue.add(`Shoutout request from ${username}!`, 'comment', 4, 'comment');
      UI.log('comment', username, `Shoutout request: ${text}`, '📢');
      return;
    }

    // Poll / first-to-type / giveaway
    if (S.pollActive) {
      if (lower.trim() === 'yes') S.pollResults.yes++;
      else if (lower.trim() === 'no') S.pollResults.no++;
    }
    if (S.fttActive && S.fttWord && lower.includes(S.fttWord.toLowerCase())) {
      S.fttActive = false;
      Queue.add(`We have a winner! ${username} was first to type ${S.fttWord}!`, 'milestone', 1, 'milestone', { pitch: 1.2 });
      UI.log('game', username, `Won "First To Type"!`, '🏆');
      el('game-status').textContent = `Winner: ${username}`;
      UI.flash('green'); return;
    }
    if (S.giveawayActive) S.giveawayEntrants.add(username);

    // Skip if safe mode or QA mode
    if (S.safeMode || S.qaMode) return;
    if (!en('en-comments')) return;

    // Activity spike detection
    S.activitySpike.push(Date.now());
    S.activitySpike = S.activitySpike.filter(t => Date.now() - t < 5000);
    if (S.activitySpike.length >= 8) {
      S.activitySpike = [];
      Queue.add('Something just set chat off — that could be a highlight moment!', 'system', 5);
      UI.log('system', 'System', '📍 Potential highlight moment!', '📍');
    }

    Queue.add(`${username} says: ${clean}`, 'comment', 7, 'comment');
    UI.log('comment', username, text, '💬');
  },

  follow(username) {
    if (!en('en-follows')) return;
    S.followsTonight++;
    el('tb-follows').textContent = S.followsTonight;
    el('s-follows').textContent  = S.followsTonight;

    // Returning viewer?
    const hist = S.viewerHistory[username] || { visits: 0 };
    S.viewerHistory[username] = { visits: hist.visits + 1, lastSeen: Date.now() };
    Loyalty.check(username, hist.visits + 1);

    const msg = hist.visits > 0
      ? `Welcome back ${username}! Great to see you again!`
      : `New follower! Welcome to the family, ${username}!`;

    Queue.add(msg, 'follow', 3, 'follow', { pitch: 1.1, gender: 'female' });
    UI.log('follow', username, hist.visits > 0 ? 'Returned follower' : 'New follower', '➕');
    UI.flash('green');

    // Follow milestones
    [10,25,50,100,250,500].forEach(m => {
      if (S.followsTonight >= m && !S.followMilestones.has(m) && en('en-milestones')) {
        S.followMilestones.add(m);
        Queue.add(`You just gained your ${m}th follow of the night! That is incredible, thank you all!`, 'milestone', 2, 'milestone', { pitch: 1.2 });
        UI.log('milestone', 'System', `${m} follows tonight!`, '🎉');
        UI.flash('green');
      }
    });
  },

  gift(username, giftName, coins, emoji, repeatCount) {
    if (!en('en-gifts')) return;
    S.coinsTonight += coins;
    S.giftsTonight++;
    el('tb-coins').textContent = S.coinsTonight.toLocaleString();
    el('s-coins').textContent  = S.coinsTonight.toLocaleString();
    el('s-gifts').textContent  = S.giftsTonight;

    // Top gifter
    S.giftCounts[username] = (S.giftCounts[username] || 0) + coins;
    if (S.giftCounts[username] > S.topGifterCoins) {
      S.topGifterCoins = S.giftCounts[username];
      S.topGifter = username;
      el('top-gifter-display').textContent = `${username} (${S.topGifterCoins.toLocaleString()} coins)`;
    }

    // Gift streaks
    const prev = S.giftStreaks[username];
    if (prev && prev.gift === giftName) {
      prev.count++;
      clearTimeout(S.giftStreakTimers[username]);
    } else {
      S.giftStreaks[username] = { gift: giftName, count: repeatCount || 1 };
    }
    S.giftStreakTimers[username] = setTimeout(() => delete S.giftStreaks[username], 10000);
    const streak = S.giftStreaks[username].count;

    // Gift goal
    S.giftGoalProgress += coins;
    this.checkGoal();
    Settings.updateGoal();

    // Thresholds
    const small  = +g('set-small')  || 100;
    const medium = +g('set-medium') || 1000;
    const large  = +g('set-large')  || 5000;

    let msg, priority, earcon, opts = {};
    if (coins >= large) {
      msg = streak > 1
        ? `OH WOW! ${username} is on a ${streak} times streak of ${giftName}! That is absolutely incredible! Thank you so much!`
        : `Oh my goodness! ${username} just sent a ${giftName}! That is an incredible gift, thank you so much!`;
      priority = 1; earcon = 'gift_large';
      opts = { pitch: 0.88, gender: 'male', rate: S.speechRate * 0.9 };
      UI.flash('gold'); setTimeout(() => UI.flash('gold'), 400);
    } else if (coins >= medium) {
      msg = streak > 1
        ? `${username} is on a ${streak} streak of ${giftName}! Amazing!`
        : `Wow! ${username} sent a ${giftName}! Thank you so much!`;
      priority = 2; earcon = 'gift_med'; opts = { pitch: 1.05 };
      UI.flash('gold');
    } else {
      msg = streak > 1
        ? `${username} is on a ${streak} ${giftName} streak!`
        : `${username} sent a ${giftName}, thank you!`;
      priority = 4; earcon = 'gift_small'; opts = { pitch: 1.0 };
    }

    Queue.add(msg, 'gift', priority, earcon, opts);
    UI.log('gift', username, `${emoji} ${giftName} (${coins.toLocaleString()} coins)${streak > 1 ? ` — ${streak}× streak!` : ''}`, emoji);
  },

  share(username) {
    if (!en('en-shares')) return;
    Queue.add(`${username} just shared your stream — absolute legend, thank you!`, 'follow', 4, 'share', { pitch: 1.1 });
    UI.log('share', username, 'Shared the stream', '📤');
  },

  subscribe(username) {
    Queue.add(`${username} just subscribed! Welcome to the family!`, 'milestone', 3, 'milestone', { pitch: 1.15 });
    UI.log('subscribe', username, 'New subscriber!', '⭐');
    UI.flash('gold');
  },

  viewers(count) {
    S.viewers = count;
    if (count > S.peakViewers) { S.peakViewers = count; el('s-peak').textContent = count; }
    el('tb-viewers').textContent = count;
    [10,25,50,100,250,500,1000,2500,5000].forEach(m => {
      if (count >= m && !S.viewerMilestones.has(m) && en('en-milestones')) {
        S.viewerMilestones.add(m);
        Queue.add(`Incredible! You just hit ${m.toLocaleString()} viewers in the room!`, 'milestone', 2, 'milestone', { pitch: 1.2 });
        UI.log('milestone', 'System', `${m.toLocaleString()} viewer milestone!`, '🎉');
        UI.flash('green');
      }
    });
  },

  checkGoal() {
    if (S.giftGoal <= 0) return;
    const pct = (S.giftGoalProgress / S.giftGoal) * 100;
    [25,50,75,100].forEach(m => {
      if (pct >= m && !S.goalMilestonesHit.includes(m)) {
        S.goalMilestonesHit.push(m);
        const msg = m === 100
          ? `Goal reached! You have hit your target of ${S.giftGoal.toLocaleString()} coins tonight! Absolutely incredible, thank you all so much!`
          : `You are now ${m}% of the way to your gift goal of ${S.giftGoal.toLocaleString()} coins! Keep it going!`;
        Queue.add(msg, 'milestone', m === 100 ? 1 : 3, m === 100 ? 'milestone' : 'gift_small');
        if (m === 100) { UI.flash('gold'); UI.flash('gold'); }
      }
    });
  }
};

// ══════════════════════════════════════════════════════════════
// LOYALTY SYSTEM
// ══════════════════════════════════════════════════════════════
const Loyalty = {
  data: {},
  tiers: [
    { visits: 50, name: 'Legend' },
    { visits: 25, name: 'Gold Regular' },
    { visits: 10, name: 'Silver Regular' },
    { visits:  3, name: 'Bronze Regular' }
  ],
  load() { try { this.data = JSON.parse(localStorage.getItem('tla-loyalty') || '{}'); } catch(_){} },
  save() { localStorage.setItem('tla-loyalty', JSON.stringify(this.data)); },
  check(username, visits) {
    const prev = this.data[username] || 0;
    const prevTier = this.tiers.find(t => prev >= t.visits);
    const newTier  = this.tiers.find(t => visits >= t.visits);
    if (newTier && (!prevTier || newTier.name !== prevTier.name)) {
      Queue.add(`${username} just became a ${newTier.name}! They have attended ${visits} of your streams!`, 'milestone', 3, 'milestone');
      UI.log('milestone', username, `Tier up: ${newTier.name}!`, '🏆');
    }
    this.data[username] = visits; this.save();
  }
};

// ══════════════════════════════════════════════════════════════
// NICKNAMES & KEYWORDS
// ══════════════════════════════════════════════════════════════
const Nicknames = {
  data: {},
  load() { try { this.data = JSON.parse(localStorage.getItem('tla-nicks') || '{}'); } catch(_){} this.render(); },
  add() {
    const u = el('nick-user').value.trim().toLowerCase();
    const greeting = el('nick-greeting').value.trim();
    if (!u || !greeting) return;
    this.data[u] = greeting;
    localStorage.setItem('tla-nicks', JSON.stringify(this.data));
    el('nick-user').value = ''; el('nick-greeting').value = '';
    this.render();
  },
  remove(u) { delete this.data[u]; localStorage.setItem('tla-nicks', JSON.stringify(this.data)); this.render(); },
  get(username) { return this.data[username.toLowerCase()] || null; },
  render() {
    el('nicknames-list').innerHTML = Object.entries(this.data).map(([u,g]) =>
      `<span class="tag" onclick="Nicknames.remove('${u}')" title="Click to remove">${u}: "${g}" ✕</span>`
    ).join('');
  }
};

const Keywords = {
  defaults: {
    'first time': "Welcome to your very first stream! So glad you are here!",
    'hello':      "Hey there, welcome in! Great to see you!",
    'love you':   "Love you too! Thank you so much!",
    'how are you':"I am doing amazing, thank you so much for asking!",
    'shoutout':   "Shoutout request received!"
  },
  data: {},
  load() {
    try { this.data = JSON.parse(localStorage.getItem('tla-kw') || '{}'); } catch(_){}
    if (!Object.keys(this.data).length) this.data = { ...this.defaults };
    this.render();
  },
  add() {
    const t = el('kw-trigger').value.trim().toLowerCase();
    const r = el('kw-response').value.trim();
    if (!t || !r) return;
    this.data[t] = r;
    localStorage.setItem('tla-kw', JSON.stringify(this.data));
    el('kw-trigger').value = ''; el('kw-response').value = '';
    this.render();
  },
  remove(t) { delete this.data[t]; localStorage.setItem('tla-kw', JSON.stringify(this.data)); this.render(); },
  check(text) { return this.data[Object.keys(this.data).find(k => text.includes(k))] || null; },
  render() {
    el('keywords-list').innerHTML = Object.entries(this.data).map(([t,r]) =>
      `<span class="tag" onclick="Keywords.remove('${t}')" title="Click to remove">"${t}" → "${r.substring(0,25)}..." ✕</span>`
    ).join('');
  }
};

// ══════════════════════════════════════════════════════════════
// GAMES
// ══════════════════════════════════════════════════════════════
const Games = {
  poll() {
    const q = prompt('Poll question:'); if (!q) return;
    S.pollActive = true; S.pollResults = { yes:0, no:0 };
    Queue.add(`Poll time! ${q} — type YES or NO in chat now!`, 'milestone', 2, 'milestone', { pitch: 1.1 });
    UI.log('game','Game',`Poll started: ${q}`,'📊');
    el('game-status').textContent = `Poll active (30s): ${q}`;
    clearTimeout(S.pollTimer);
    S.pollTimer = setTimeout(() => {
      S.pollActive = false;
      const tot = S.pollResults.yes + S.pollResults.no;
      if (tot) {
        const yp = Math.round((S.pollResults.yes / tot) * 100);
        Queue.add(`Poll results: ${yp}% voted yes and ${100-yp}% voted no, from ${tot} votes!`, 'milestone', 2, 'milestone');
        UI.log('game','Game',`Poll: Yes ${yp}% / No ${100-yp}%`,'📊');
      } else {
        Queue.add('Poll ended with no votes. Chat was quiet on that one!','system',5);
      }
      el('game-status').textContent = `Poll ended — Yes: ${S.pollResults.yes} / No: ${S.pollResults.no}`;
    }, 30000);
  },
  firstToType() {
    const w = prompt('What word should they type first?'); if (!w) return;
    S.fttActive = true; S.fttWord = w;
    Queue.add(`Game time! First person to type the word ${w} in chat wins a shoutout!`, 'milestone', 2, 'milestone', { pitch: 1.1 });
    UI.log('game','Game',`First to type: "${w}"`,'⌨');
    el('game-status').textContent = `Waiting for first to type: "${w}"`;
  },
  startGiveaway() {
    S.giveawayActive = true; S.giveawayEntrants = new Set();
    Queue.add('Giveaway mode active! Everyone commenting is automatically entered to win!', 'milestone', 2, 'milestone', { pitch: 1.15 });
    UI.log('game','Game','Giveaway started','🎁');
    el('game-status').textContent = `Giveaway active — 0 entrants`;
    const t = setInterval(() => {
      if (!S.giveawayActive) { clearInterval(t); return; }
      el('game-status').textContent = `Giveaway active — ${S.giveawayEntrants.size} entrants`;
    }, 2000);
  },
  pickWinner() {
    const ents = [...S.giveawayEntrants];
    S.giveawayActive = false;
    if (!ents.length) { Queue.add('No entrants yet — start a giveaway first!','system',4); return; }
    const w = ents[Math.floor(Math.random() * ents.length)];
    Queue.add('Drumroll please...', 'system', 2, 'gift_small');
    setTimeout(() => {
      Queue.add(`And the winner is... ${w}! Congratulations! Please get in touch to claim your prize!`, 'milestone', 1, 'milestone', { pitch: 1.2 });
      UI.log('game','Game',`Giveaway winner: ${w}`,'🏆');
      el('game-status').textContent = `Winner: ${w} (from ${ents.length} entrants)`;
      UI.flash('gold');
    }, 2500);
  },
  wheel() {
    const raw = prompt('Enter wheel options separated by commas:'); if (!raw) return;
    const opts = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (opts.length < 2) return;
    Queue.add('The wheel is spinning...', 'system', 3, 'gift_small');
    el('game-status').textContent = 'Wheel spinning...';
    let ticks = 0; const max = 18;
    const iv = setInterval(() => {
      Audio.play('tick'); ticks++;
      if (ticks >= max) {
        clearInterval(iv);
        const result = opts[Math.floor(Math.random() * opts.length)];
        setTimeout(() => {
          Queue.add(`The wheel has landed on... ${result}!`, 'milestone', 1, 'milestone', { pitch: 1.15 });
          UI.log('game','Game',`Wheel: ${result}`,'🎡');
          el('game-status').textContent = `Wheel result: ${result}`;
        }, 600);
      }
    }, 100 + ticks * 12);
  },
  countdown() {
    const mins = +(prompt('Countdown from how many minutes?','5') || 0);
    if (!mins || isNaN(mins)) return;
    let secs = mins * 60;
    Queue.add(`Starting a ${mins} minute countdown!`,'system',3);
    el('game-status').textContent = `Countdown: ${mins}:00`;
    clearInterval(S.countdownTimer);
    const marks = [300,180,120,60,30,10,9,8,7,6,5,4,3,2,1];
    S.countdownTimer = setInterval(() => {
      secs--;
      const m = Math.floor(secs/60), s = secs%60;
      el('game-status').textContent = `Countdown: ${m}:${String(s).padStart(2,'0')}`;
      if (marks.includes(secs)) {
        if      (secs > 60) Queue.add(`${m} minutes remaining!`,'system',6);
        else if (secs > 10) Queue.add(`${secs} seconds remaining!`,'system',4);
        else if (secs > 0)  Queue.add(`${secs}!`,'system',2,null,{rate:1.5});
        else {
          Queue.add('Time is up! Go go go!','milestone',1,'milestone',{pitch:1.2});
          clearInterval(S.countdownTimer); el('game-status').textContent = 'Countdown ended';
        }
      }
    }, 1000);
  },
  stop() {
    S.pollActive = S.fttActive = S.giveawayActive = false;
    clearTimeout(S.pollTimer); clearInterval(S.countdownTimer);
    el('game-status').textContent = 'All games stopped';
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
    const add = (fn, mins) => { S.reminderIntervals.push(setInterval(fn, mins * 60000)); };
    add(() => Queue.add("Hey, have you had some water recently? Take a quick sip!",'system',7,null,{volume:.7}), +g('set-water')||20);
    add(() => Queue.add("Don't forget to ask your viewers to hit that follow button!",'system',7,null,{volume:.7}), +g('set-follow-nudge')||15);
    add(() => Queue.add("Good time to mention your other social media!",'system',7,null,{volume:.7}), +g('set-socials')||25);
    add(() => Queue.add("Quick posture check! Sit up straight, take a breath, you are doing amazing.",'system',8,null,{volume:.6}), +g('set-posture')||45);
    add(() => {
      const mins = Math.floor(S.streamDuration/60);
      Queue.add(`Stats update: ${S.viewers} people watching, ${S.followsTonight} follows tonight, ${S.coinsTonight.toLocaleString()} coins earned.`,'system',6);
    }, +g('set-viewers-timer')||5);
    add(() => Queue.add(`Earnings so far: approximately ${S.coinsTonight.toLocaleString()} coins. ${S.topGifter ? `Top gifter is ${S.topGifter}.` : ''}`,'system',6), +g('set-earnings')||10);
    // Live duration
    S.reminderIntervals.push(setInterval(() => {
      const m = Math.floor(S.streamDuration/60);
      const h = Math.floor(m/60), min = m%60;
      const dur = h > 0 ? `${h} hour${h>1?'s':''} and ${min} minute${min!==1?'s':''}` : `${m} minute${m!==1?'s':''}`;
      Queue.add(`You have been live for ${dur}.`,'system',8,null,{volume:.65});
    }, 30 * 60000));
  },
  stop() { S.reminderIntervals.forEach(clearInterval); S.reminderIntervals = []; }
};

// ══════════════════════════════════════════════════════════════
// VOICE COMMANDS
// ══════════════════════════════════════════════════════════════
const VoiceCmd = {
  rec: null,
  init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice commands need Chrome or Edge browser.'); return false; }
    this.rec = new SR();
    this.rec.continuous = true;
    this.rec.interimResults = false;
    this.rec.lang = 'en-GB';
    this.rec.onresult = e => {
      const t = e.results[e.results.length-1][0].transcript.toLowerCase().trim();
      this.handle(t);
    };
    this.rec.onerror = e => { if (e.error !== 'no-speech') { S.vcEnabled = false; UI.updateVoice(); } };
    this.rec.onend = () => { if (S.vcEnabled) { try { this.rec.start(); } catch(_){} } };
    return true;
  },
  start() { if (!this.rec && !this.init()) return; try { this.rec.start(); } catch(_){} UI.updateVoice(); },
  stop()  { try { this.rec && this.rec.stop(); } catch(_){} UI.updateVoice(); },
  handle(text) {
    const wake = (g('set-wakeword') || 'hey stream').toLowerCase();
    if (!text.includes(wake)) return;
    const cmd = text.replace(new RegExp(wake,'g'),'').trim();
    UI.log('system','Voice Cmd', cmd, '🎤');
    if      (cmd.includes('skip'))      App.skip();
    else if (cmd.includes('repeat'))    App.repeatLast();
    else if (cmd.includes('unmute'))    { if (S.isMuted) App.toggleMute(); }
    else if (cmd.includes('mute'))      App.toggleMute();
    else if (cmd.includes('how long'))  { const m=Math.floor(S.streamDuration/60); Queue.add(`You have been live for ${m} minutes.`,'system',2); }
    else if (cmd.includes('stats'))     App.readStats();
    else if (cmd.includes('goal'))      { const p=S.giftGoal>0?Math.round((S.giftGoalProgress/S.giftGoal)*100):0; Queue.add(`Goal is ${p}% complete. ${S.giftGoalProgress.toLocaleString()} of ${S.giftGoal.toLocaleString()} coins.`,'system',2); }
    else if (cmd.includes('qa mode') || cmd.includes('q and a')) App.setQA(!S.qaMode);
    else if (cmd.includes('water'))     App.waterBreak();
    else if (cmd.includes('panic'))     App.panic();
    else if (cmd.includes('slow down')) App.setRate(Math.max(0.5, S.speechRate-0.25));
    else if (cmd.includes('speed up'))  App.setRate(Math.min(2.5, S.speechRate+0.25));
    else if (cmd.includes('earnings'))  Queue.add(`You have earned approximately ${S.coinsTonight.toLocaleString()} coins tonight.`,'system',2);
    else if (cmd.includes('top gifter'))Queue.add(S.topGifter?`Top gifter is ${S.topGifter} with ${S.topGifterCoins.toLocaleString()} coins.`:'No gifts yet tonight.','system',2);
    else if (cmd.includes('good night'))App.endStream();
    else if (cmd.startsWith('shoutout')) {
      const name = cmd.replace('shoutout','').trim();
      if (name) Queue.add(`Shoutout to the amazing ${name}! Go show them some love!`,'milestone',2,'milestone',{pitch:1.1});
    }
  }
};

// ══════════════════════════════════════════════════════════════
// SIMULATION MODE
// ══════════════════════════════════════════════════════════════
const Sim = {
  timers: [],
  toggle() { S.isSimulating ? this.stop() : this.start(); },
  start() {
    S.isSimulating = true;
    el('sim-btn').textContent = '⏹ Stop Simulation';
    el('sim-btn').classList.add('active');
    el('sim-badge').classList.remove('hidden');
    App.goLive();

    let viewers = 15;
    this.timers.push(setInterval(() => {
      viewers = Math.max(5, Math.min(800, viewers + Math.floor(Math.random()*9)-3));
      Events.viewers(viewers);
    }, 5000));
    this.timers.push(setInterval(() => {
      Events.comment(rand(FAKE_USERS), rand(COMMENTS));
    }, 3500 + Math.random()*3500));
    this.timers.push(setInterval(() => {
      Events.follow(rand(FAKE_USERS) + Math.floor(Math.random()*99));
    }, 12000 + Math.random()*18000));
    this.timers.push(setInterval(() => {
      Events.share(rand(FAKE_USERS));
    }, 35000 + Math.random()*30000));
    this.timers.push(setInterval(() => {
      const g = GIFTS[Math.floor(Math.random()*5)];
      Events.gift(rand(FAKE_USERS), g.n, g.c, g.e, 1);
    }, 18000 + Math.random()*20000));
    this.timers.push(setInterval(() => {
      const g = GIFTS[5 + Math.floor(Math.random()*3)];
      Events.gift(rand(FAKE_USERS), g.n, g.c, g.e, 1);
    }, 55000 + Math.random()*55000));
    this.timers.push(setInterval(() => {
      const g = GIFTS[9 + Math.floor(Math.random()*3)];
      Events.gift(rand(FAKE_USERS), g.n, g.c, g.e, 1);
    }, 150000 + Math.random()*120000));
  },
  stop() {
    S.isSimulating = false;
    this.timers.forEach(clearInterval); this.timers = [];
    el('sim-btn').textContent = '▶ Start Simulation';
    el('sim-btn').classList.remove('active');
    el('sim-badge').classList.add('hidden');
  }
};

// ══════════════════════════════════════════════════════════════
// TIKTOK SOCKET BRIDGE
// ══════════════════════════════════════════════════════════════
const TikTok = {
  modal: null,
  toggleConnect() {
    if (S.tiktokConnected) {
      socket.emit('disconnect-tiktok');
      return;
    }
    this.showModal();
  },
  showModal() {
    const div = document.createElement('div');
    div.className = 'modal-overlay'; div.id = 'tiktok-modal';
    div.innerHTML = `
      <div class="modal-box">
        <div class="modal-title">🔴 Connect to TikTok Live</div>
        <div class="modal-sub">Enter your TikTok username to connect to your live stream. The stream must already be live.</div>
        <input type="text" class="modal-input" id="tiktok-username-input" placeholder="@yourusername" autocomplete="off">
        <div class="modal-btns">
          <button class="modal-btn-go" onclick="TikTok.connect()">Go Live</button>
          <button class="modal-btn-cancel" onclick="TikTok.closeModal()">Cancel</button>
        </div>
        <div class="modal-error" id="modal-error"></div>
      </div>`;
    document.body.appendChild(div);
    document.getElementById('tiktok-username-input').focus();
    document.getElementById('tiktok-username-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') TikTok.connect();
    });
  },
  connect() {
    const username = document.getElementById('tiktok-username-input').value.trim();
    if (!username) return;
    document.getElementById('modal-error').textContent = 'Connecting...';
    socket.emit('connect-tiktok', { username });
  },
  closeModal() {
    const m = document.getElementById('tiktok-modal');
    if (m) m.remove();
  }
};

// Socket event handlers
socket.on('tiktok-connecting', ({ username }) => {
  Speech.speak(`Connecting to ${username}'s live stream. Please wait.`, { rate: S.speechRate });
  UI.log('system','TikTok',`Connecting to @${username}...`,'🔄');
});

socket.on('tiktok-connected', ({ username }) => {
  S.tiktokConnected = true; S.tiktokUsername = username;
  TikTok.closeModal();
  el('btn-connect').textContent = 'DISCONNECT';
  el('btn-connect').classList.add('live');
  App.goLive();
  Queue.add(`Connected to ${username}'s TikTok live stream. Welcome everyone!`, 'system', 2, 'milestone');
  UI.log('system','TikTok',`Connected to @${username}`,'✅');
});

socket.on('tiktok-disconnected', ({ reason }) => {
  S.tiktokConnected = false;
  el('btn-connect').textContent = 'CONNECT TO TIKTOK';
  el('btn-connect').classList.remove('live');
  Queue.add(`Disconnected from TikTok. ${reason}`, 'alert', 2, 'alert');
  UI.log('alert','TikTok',`Disconnected: ${reason}`,'❌');
});

socket.on('tiktok-error', ({ message }) => {
  const errEl = document.getElementById('modal-error');
  if (errEl) errEl.textContent = message;
  else Queue.add(`TikTok error: ${message}`, 'alert', 2, 'alert');
  UI.log('alert','TikTok',`Error: ${message}`,'⚠');
});

socket.on('event', (data) => {
  switch (data.type) {
    case 'comment':      Events.comment(data.username, data.text); break;
    case 'gift':         Events.gift(data.username, data.giftName, data.coins, data.emoji, data.repeatCount); break;
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
    S.isLive = true; S.startTime = Date.now();
    el('live-dot').classList.add('on');
    el('live-label').textContent = 'LIVE';
    S.streamInterval = setInterval(() => {
      S.streamDuration++;
      const h = Math.floor(S.streamDuration/3600);
      const m = Math.floor((S.streamDuration%3600)/60);
      const s = S.streamDuration%60;
      el('stream-timer').textContent =
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      el('s-time').textContent = h>0 ? `${h}h${String(m).padStart(2,'0')}m` : `${m}m`;
    }, 1000);
    Reminders.start();
  },
  preStreamChecklist() {
    Queue.add("Let's do a quick pre-stream check. Make sure your microphone is on. Get your water nearby. Check your battery is charged. You are ready to go live. Have an absolutely amazing stream!", 'system', 10, null, { rate: 0.92 });
    UI.log('system','System','✅ Pre-stream checklist','✅');
  },
  toggleMute() {
    S.isMuted = !S.isMuted;
    const btn = el('mute-btn');
    if (S.isMuted) {
      Speech.cancel(); Queue.clear();
      btn.textContent = '🔇 MUTED — click to unmute [M]';
      btn.classList.add('muted');
    } else {
      btn.textContent = '🔊 UNMUTED [M]';
      btn.classList.remove('muted');
    }
  },
  setRate(val) {
    S.speechRate = parseFloat(val);
    el('rate-slider').value = val;
    el('rate-val').textContent = parseFloat(val).toFixed(1) + '×';
    Settings.save();
  },
  setVolume(val) {
    S.voiceVolume = val/100;
    el('vol-slider').value = val;
    el('vol-val').textContent = Math.round(val) + '%';
    Settings.save();
  },
  setSfxVolume(val) {
    S.sfxVolume = val/100;
    el('sfx-slider').value = val;
    el('sfx-val').textContent = Math.round(val) + '%';
  },
  setQA(val) {
    S.qaMode = val; el('qa-toggle').checked = val;
    Queue.add(val ? 'Q and A mode on. Only questions will be announced.' : 'Q and A mode off.', 'system', 3);
  },
  setSafe(val) { S.safeMode = val; Queue.add(val ? 'Safe mode on. Only gifts and follows announced.' : 'Safe mode off.', 'system', 3); },
  setCalm(val) { S.calmMode = val; el('calm-toggle').checked = val; Queue.add(val ? 'Calm mode on. Events batched and quietened.' : 'Calm mode off.', 'system', 3); },
  setToxic(val) { S.toxicFilter = val; },
  setBleep(val) { S.bleepProfanity = val; },
  setVoiceCommands(val) {
    S.vcEnabled = val;
    if (val) { VoiceCmd.start(); Queue.add(`Voice commands active. Say ${g('set-wakeword')||'hey stream'} followed by your command.`,'system',3); }
    else VoiceCmd.stop();
  },
  skip() {
    Speech.cancel(); S.isAnnouncing = false;
    setTimeout(() => Queue.next(), 100);
  },
  repeatLast() { if (S.lastText) Queue.add(S.lastText, S.lastType, 2); },
  readStats() {
    const m = Math.floor(S.streamDuration/60);
    const msg = `Stats: ${S.viewers} viewers in the room. ${S.followsTonight} follows tonight. ${S.coinsTonight.toLocaleString()} coins earned. ${S.topGifter ? `Top gifter: ${S.topGifter}.` : ''}`;
    Queue.add(msg, 'system', 2);
  },
  waterBreak() {
    Queue.clear();
    Queue.add("Taking a quick water break — back in a moment chat!", 'system', 1, null, { volume: 0.9 });
    UI.log('system','System','💧 Water break','💧');
    setTimeout(() => { if (!S.isMuted) Queue.add('Water break over — back and ready to go!', 'system', 1); }, 5*60000);
  },
  panic() {
    Queue.clear();
    const wasMuted = S.isMuted;
    S.isMuted = false;
    Audio.play('panic');
    Speech.speak('Stream paused safely. You are okay. Take your time. Everything is fine. Breathe.', { rate: 0.82, pitch: 0.9, volume: 1.0, onend: () => { S.isMuted = true; el('mute-btn').textContent='🔇 MUTED — click to unmute [M]'; el('mute-btn').classList.add('muted'); } });
    UI.log('alert','PANIC','⚠ Panic activated — all audio muted','🚨');
    UI.flash('red');
    el('btn-panic').style.background = '#661111';
    setTimeout(() => { el('btn-panic').style.background = ''; }, 8000);
  },
  endStream() {
    if (!confirm('End the stream and hear your full summary?')) return;
    Sim.stop(); Reminders.stop(); S.isLive = false;
    clearInterval(S.streamInterval);
    Queue.clear();
    const m = Math.floor(S.streamDuration/60);
    const h = Math.floor(m/60), mins = m%60;
    const dur = h > 0 ? `${h} hour${h>1?'s':''} and ${mins} minute${mins!==1?'s':''}` : `${m} minute${m!==1?'s':''}`;
    const summary = `Tonight was a fantastic stream. Here is your end of stream summary. ` +
      `You were live for ${dur}. ` +
      `You gained ${S.followsTonight} new followers tonight. ` +
      `Your total coins earned were approximately ${S.coinsTonight.toLocaleString()}. ` +
      (S.topGifter ? `Your top gifter was ${S.topGifter} with ${S.topGifterCoins.toLocaleString()} coins — absolutely amazing. ` : '') +
      (S.topCommenter ? `Your most active chatter was ${S.topCommenter}. ` : '') +
      `Your peak viewer count was ${S.peakViewers} people. ` +
      `Thank you for streaming. You did an incredible job. Rest up, and see you next time.`;
    Speech.speak(summary, { rate: 0.9, volume: 1.0 });
    UI.log('system','Stream Ended', summary, '🔴');
    el('live-dot').classList.remove('on');
    el('live-label').textContent = 'ENDED';
    el('btn-connect').textContent = 'CONNECT TO TIKTOK';
    el('btn-connect').classList.remove('live');
    if (S.tiktokConnected) socket.emit('disconnect-tiktok');
  },
  handleKey(e) {
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
    switch(e.key.toLowerCase()) {
      case 'm': this.toggleMute(); break;
      case 's': this.skip(); break;
      case 'r': this.repeatLast(); break;
      case 'p': this.panic(); break;
      case 'q': this.setQA(!S.qaMode); break;
      case 'c': const nv = !S.calmMode; el('calm-toggle').checked = nv; this.setCalm(nv); break;
      case '-': this.setRate(Math.max(0.5, S.speechRate-0.1)); break;
      case '+': case '=': this.setRate(Math.min(2.5, S.speechRate+0.1)); break;
    }
  }
};

// ══════════════════════════════════════════════════════════════
// TEST BUTTONS
// ══════════════════════════════════════════════════════════════
const Test = {
  comment()      { Events.comment(rand(FAKE_USERS), rand(COMMENTS)); },
  question()     { Events.comment(rand(FAKE_USERS), 'What headset do you use for streaming?'); },
  giftSmall()    { const g=GIFTS[2]; Events.gift('TestFan',g.n,g.c,g.e,1); },
  giftMedium()   { const g=GIFTS[7]; Events.gift('TestFan',g.n,g.c,g.e,1); },
  giftLarge()    { const g=GIFTS[10]; Events.gift('VIPFan',g.n,g.c,g.e,1); },
  follow()       { Events.follow('NewFan'+Math.floor(Math.random()*99)); },
  share()        { Events.share('ShareLegend'); },
  milestone()    { Events.viewers(100); },
  alert()        { Queue.add('Warning! This is a test alert.','alert',1,'alert',{pitch:.85,gender:'male'}); UI.log('alert','System','Alert test','⚠'); },
  streak()       { ['🌹','🌹','🌹'].forEach((_,i)=>setTimeout(()=>Events.gift('StreakFan','Rose',1,'🌹',i+1),i*400)); },
  returnViewer() { S.viewerHistory['OldFriend']={visits:5,lastSeen:Date.now()-86400000}; Events.follow('OldFriend'); },
  giftStorm()    { ['Fan1','Fan2','Fan3','Fan4'].forEach((u,i)=>setTimeout(()=>Events.gift(u,'Diamond',200,'💎',1),i*350)); }
};

// ══════════════════════════════════════════════════════════════
// UI
// ══════════════════════════════════════════════════════════════
const UI = {
  log(type, username, text, icon) {
    const c = el('log-container');
    const t = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const d = document.createElement('div');
    d.className = 'log-entry new';
    d.innerHTML = `<span class="log-time">${t}</span><span class="log-badge ${type}">${type}</span><span class="log-text"><span class="un">${esc(username)}</span> — ${esc(text)}</span>`;
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
    // Remove animation class after it plays
    setTimeout(() => d.classList.remove('new'), 500);
  },
  clearLog() { el('log-container').innerHTML = ''; },
  setNP(item) {
    el('np-type').textContent = item.type.toUpperCase();
    el('np-type').className = `np-type ${item.type}`;
    el('np-text').textContent = item.text;
    const bar = el('np-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = 'width 4s linear'; bar.style.width = '0%';
      });
    });
  },
  clearNP() {
    el('np-type').textContent = 'IDLE'; el('np-type').className = 'np-type system';
    el('np-text').textContent = 'Waiting for events...';
    el('np-bar').style.width = '0%';
  },
  updateQueue() {
    el('queue-count').textContent = S.queue.length;
    el('tb-queue').textContent = S.queue.length;
    el('queue-list').innerHTML = S.queue.slice(0,5).map(item =>
      `<div class="queue-item"><span class="qi-badge ${item.type}">${item.type.slice(0,4)}</span>${esc(item.text.slice(0,55))}${item.text.length>55?'…':''}</div>`
    ).join('') + (S.queue.length>5 ? `<div class="queue-item" style="color:var(--text3)">…and ${S.queue.length-5} more</div>` : '');
  },
  updateVoice() {
    el('voice-dot').className = 'voice-dot' + (S.vcEnabled ? ' on' : '');
    el('voice-label').textContent = S.vcEnabled ? 'MIC ON' : 'MIC OFF';
  },
  flash(color) {
    const o = el('flash-overlay');
    o.className = `flash-overlay flash-${color} active`;
    setTimeout(() => o.classList.remove('active'), 700);
  },
  tab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    el(`tab-${name}`).classList.add('active');
    el(`tp-${name}`).classList.add('active');
  }
};

// ══════════════════════════════════════════════════════════════
// SETUP WIZARD
// ══════════════════════════════════════════════════════════════
const Wizard = {
  step: 0,
  ans: {},
  steps: [
    { id:'name',  type:'text',    q:"Welcome to TikTok Live Announcer — built for accessibility. First, what is your streamer name?", placeholder:'Your name', default:'Streamer' },
    { id:'rate',  type:'opts',    q:"What voice speed do you prefer?", opts:[{l:'Slow (0.8×)',v:.8},{l:'Normal (1.0×)',v:1.0},{l:'Fast (1.2×)',v:1.2},{l:'Very fast (1.5×)',v:1.5}], default:1.0 },
    { id:'toxic', type:'opts',    q:"Should the toxic comment filter be on? This silently skips abusive comments so you never hear them.", opts:[{l:'Yes — protect me',v:true},{l:'No — read everything',v:false}], default:true },
    { id:'goal',  type:'text',    q:"What is your gift coin goal for tonight? Enter a number, or 0 for no goal.", placeholder:'e.g. 5000', default:'1000' },
    { id:'vc',    type:'opts',    q:"Do you want voice commands? Say your wake word to control the app hands-free. Needs Chrome or Edge.", opts:[{l:'Yes please',v:true},{l:'No thanks',v:false}], default:false },
    { id:'done',  type:'finish',  q:"All set! Everything is configured. Let's launch your announcer." }
  ],
  start() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('wizard').classList.remove('hidden');
    this.step = 0; this.ans = {};
    this.render();
  },
  render() {
    const s = this.steps[this.step];
    const total = this.steps.length;
    el('wiz-dots').innerHTML = Array.from({length:total},(_,i)=>
      `<div class="wiz-dot${i<=this.step?' active':''}"></div>`).join('');
    el('wiz-step').textContent = `Step ${this.step+1} of ${total}`;
    setTimeout(() => {
      Speech.speak(s.q, { rate: 1.0, volume: 1.0 });
      el('wiz-speaking').textContent = '🔊 Speaking...';
      setTimeout(() => el('wiz-speaking').textContent = '', 3500);
    }, 200);
    const c = el('wiz-content');
    c.innerHTML = `<p class="wizard-text">${s.q}</p>`;
    if (s.type === 'text') {
      c.innerHTML += `<input type="text" class="wizard-input" id="wiz-inp" placeholder="${s.placeholder}" value="${s.default||''}">
        <button class="wizard-btn" onclick="Wizard.next()">Next →</button>`;
      setTimeout(() => document.getElementById('wiz-inp')?.focus(), 100);
      document.getElementById('wiz-inp')?.addEventListener('keydown', e => { if(e.key==='Enter') Wizard.next(); });
    } else if (s.type === 'opts') {
      c.innerHTML += `<div class="wizard-options">${s.opts.map(o=>`<button class="wiz-opt" data-val='${JSON.stringify(o.v)}' onclick="Wizard.pick(this,'${s.id}',this.dataset.val)">${o.l}</button>`).join('')}</div>
        <button class="wizard-btn" onclick="Wizard.next()">Next →</button>`;
      const def = s.opts.find(o => o.v === s.default);
      if (def) {
        setTimeout(() => {
          document.querySelectorAll('.wiz-opt').forEach(b => { if (b.textContent === def.l) { b.classList.add('selected'); this.ans[s.id] = s.default; } });
        }, 50);
      }
    } else if (s.type === 'finish') {
      c.innerHTML += `<button class="wizard-btn" onclick="Wizard.finish()">🚀 Launch Announcer!</button>`;
    }
  },
  pick(el, id, valStr) {
    document.querySelectorAll('.wiz-opt').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    try { this.ans[id] = JSON.parse(valStr); } catch(_) { this.ans[id] = valStr; }
  },
  next() {
    const s = this.steps[this.step];
    if (s.type === 'text') {
      const inp = document.getElementById('wiz-inp');
      this.ans[s.id] = (inp ? inp.value.trim() : '') || s.default;
    }
    this.step++;
    if (this.step >= this.steps.length) { this.finish(); return; }
    this.render();
  },
  finish() {
    const a = this.ans;
    if (a.name) el('set-name').value = a.name;
    if (a.rate) App.setRate(a.rate);
    if (a.toxic !== undefined) { S.toxicFilter = a.toxic; el('toxic-toggle').checked = a.toxic; }
    if (a.goal)  { el('set-goal').value = a.goal; Settings.saveGoal(); }
    Settings.save();
    localStorage.setItem('tla-wizard','done');
    document.getElementById('wizard').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    const name = a.name || 'Streamer';
    Speech.speak(`Welcome ${name}! Your announcer is ready. Click start simulation to test everything, or connect to TikTok to go live. Press M to mute, S to skip, R to repeat, and P for the panic button. Enjoy your stream!`, { rate: S.speechRate, volume: 1.0 });
    UI.log('system','System','🟢 Announcer ready — have a great stream!','🟢');
    if (a.vc) setTimeout(() => { el('vc-toggle').checked = true; App.setVoiceCommands(true); }, 3000);
  }
};

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════
function el(id)   { return document.getElementById(id); }
function g(id)    { return el(id)?.value || ''; }
function en(id)   { return el(id)?.checked !== false; }
function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Load voices
  Speech.load();
  if (speechSynthesis.onvoiceschanged !== undefined)
    speechSynthesis.onvoiceschanged = () => Speech.load();

  // Keyboard shortcuts
  document.addEventListener('keydown', e => App.handleKey(e));

  // Load settings
  Settings.load();

  // Battery monitoring
  if (navigator.getBattery) {
    navigator.getBattery().then(bat => {
      const check = () => {
        if (bat.level < 0.2 && !bat.charging) {
          Queue.add(`Battery warning! You are at ${Math.round(bat.level*100)}%. Please plug in soon.`, 'alert', 2, 'alert');
        }
      };
      bat.addEventListener('levelchange', check);
      setInterval(check, 5*60000);
    });
  }

  // First time? Show wizard
  if (!localStorage.getItem('tla-wizard')) {
    Wizard.start();
  } else {
    document.getElementById('wizard').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    setTimeout(() => {
      Speech.speak('TikTok Live Announcer is ready. Press start simulation to test, or connect to TikTok to go live.', { rate: S.speechRate, volume: 1.0 });
      UI.log('system','System','🟢 Announcer ready','🟢');
    }, 500);
  }
});
