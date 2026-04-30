'use strict';

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const FAKE_USERS = ['StarGazer99','MikeyMike','LunaLove','TechWizard','SarahSunshine',
  'DarkKnight88','PinkPanda','GameOn2024','CoolCat777','VibeCheck','NightOwl',
  'MoonChild','ElectricDave','CherryBlossom','TigerKing2','GeminiRose','NeonLights'];
const FAKE_GIFTS = [
  {n:'Rose',c:1,e:'🌹'},{n:'Finger Heart',c:5,e:'🤞'},{n:'Football',c:10,e:'⚽'},
  {n:'Ice Cream',c:20,e:'🍦'},{n:'Crown',c:50,e:'👑'},{n:'Rocket',c:100,e:'🚀'},
  {n:'Diamond',c:200,e:'💎'},{n:'Dragon',c:500,e:'🐉'},{n:'Lion',c:1000,e:'🦁'},
  {n:'Universe',c:5000,e:'🌌'},{n:'Galaxy',c:10000,e:'🌠'}
];
const FAKE_COMMENTS = [
  'love your stream!','hello there!','first time here!','this is amazing',
  'you are so talented','what headset do you use?','how long have you been streaming?',
  'love the energy today','giving you a follow now','so entertaining tonight',
  'you make my day every stream','can you do a shoutout please?','love from the UK',
  'never miss a stream','incredible content tonight','you are the best!'
];
const TOXIC_WORDS = ['hate','stupid','idiot','ugly','kill yourself','loser','moron'];
const PROFANITY   = ['damn','crap','hell','bloody'];
const DIAMOND_GLOW = [
  {name:'Bec',     handle:'rebeccalouiseking68'},
  {name:'Chloe',   handle:'itzchloebitches'},
  {name:'Chris',   handle:'chris_20234'},
  {name:'Danny',   handle:'demonking66613'},
  {name:'David',   handle:'david___24___'},
  {name:'Dem',     handle:'demiking32'},
  {name:'Devin',   handle:'devnation3'},
  {name:'Ellie',   handle:'xelliexloux'},
  {name:'Emily',   handle:'emilybridge'},
  {name:'Keano',   handle:'kristenkeano'},
  {name:'Lady D',  handle:'thisismeladyd7'},
  {name:'Liam',    handle:'l.ward9999'},
  {name:'Reiss',   handle:'chubby_cub96'},
  {name:'Rob',     handle:'rob.bitton96'},
  {name:'Rory',    handle:'atmyexpenselive'},
  {name:'TeeTee',  handle:'cheekytia92'},
  {name:'That Guy',handle:'kingcobra7796'}
];

// ══════════════════════════════════════════════════════════
// SOUND LIBRARY
// ══════════════════════════════════════════════════════════
const SOUNDS = {
  'Coin Chime':      [[523,0,.12,'sine',.6],[659,.1,.22,'sine',.5]],
  'Double Ding':     [[880,0,.06,'sine',.7],[880,.08,.18,'sine',.5],[1047,.15,.28,'sine',.5]],
  'Bell Tower':      [[440,0,.1,'sine',.8],[554,.09,.2,'sine',.6],[659,.18,.32,'sine',.5]],
  'Cash Register':   [[1047,0,.05,'square',.25],[784,.04,.1,'sine',.6],[1047,.09,.18,'sine',.7],[1568,.16,.28,'sine',.6]],
  'Triple Coin':     [[523,0,.07,'sine',.6],[523,.09,.16,'sine',.6],[523,.18,.27,'sine',.7]],
  'Pop':             [[400,0,.06,'sine',.8],[250,.04,.1,'sine',.5]],
  'Double Pop':      [[400,0,.05,'sine',.7],[250,.04,.09,'sine',.5],[400,.11,.16,'sine',.7]],
  'Bubble':          [[300,0,.08,'sine',.6],[200,.05,.14,'sine',.5]],
  'Sparkle':         [[1046,0,.07,'sine',.6],[1318,.06,.13,'sine',.6],[1568,.12,.2,'sine',.5],[2093,.18,.28,'sine',.4]],
  'Magic Twinkle':   [[1046,0,.06,'sine',.5],[1318,.05,.11,'sine',.5],[1568,.1,.16,'sine',.5],[1318,.15,.22,'sine',.45],[1046,.2,.3,'sine',.45]],
  'Fairy Dust':      [[2093,0,.05,'sine',.4],[1760,.04,.1,'sine',.4],[1568,.08,.15,'sine',.4],[1318,.12,.2,'sine',.4],[1047,.18,.28,'sine',.5]],
  'Power Up':        [[261,0,.07,'square',.3],[330,.06,.13,'square',.3],[392,.12,.19,'square',.3],[523,.18,.28,'square',.35]],
  'Level Up':        [[523,0,.1,'sine',.5],[659,.09,.18,'sine',.55],[784,.17,.26,'sine',.55],[1047,.24,.38,'sine',.6]],
  'Retro Game':      [[523,0,.06,'square',.35],[659,.05,.11,'square',.35],[784,.1,.16,'square',.35],[1047,.15,.24,'square',.4]],
  'Game Start':      [[392,0,.08,'square',.3],[523,.07,.14,'square',.35],[659,.13,.2,'square',.35],[784,.19,.3,'square',.4]],
  'Boss Fight':      [[110,0,.1,'square',.4],[138,.09,.19,'square',.4],[110,.18,.28,'square',.4],[165,.27,.4,'square',.45]],
  'Trumpet Fanfare': [[523,0,.12,'triangle',.5],[659,.1,.22,'triangle',.55],[784,.2,.32,'triangle',.55],[1047,.3,.48,'triangle',.65]],
  'Royal Fanfare':   [[261,0,.12,'square',.3],[392,0,.18,'sine',.55],[523,.1,.22,'sine',.65],[659,.19,.3,'sine',.65],[784,.28,.42,'sine',.6],[1047,.38,.58,'sine',.7]],
  'Victory Jingle':  [[784,0,.1,'sine',.5],[988,.09,.18,'sine',.55],[1175,.17,.26,'sine',.55],[988,.25,.34,'sine',.5],[1175,.32,.5,'sine',.65]],
  'Grand Fanfare':   [[262,0,.1,'square',.25],[330,.05,.15,'square',.3],[392,.1,.2,'square',.35],[523,.15,.25,'square',.4],[659,.22,.32,'triangle',.5],[784,.3,.42,'triangle',.55],[1047,.38,.6,'triangle',.65]],
  'Alert Beep':      [[880,0,.14,'square',.5],[880,.18,.32,'square',.5]],
  'Double Alert':    [[1047,0,.1,'square',.5],[1047,.13,.23,'square',.5],[1047,.26,.38,'square',.6]],
  'Warning Siren':   [[440,0,.25,'sawtooth',.3],[554,.2,.45,'sawtooth',.3],[440,.4,.65,'sawtooth',.3]],
  'Ping':            [[1318,0,.04,'sine',.8],[1318,.04,.2,'sine',.4]],
  'Big Boom':        [[55,0,.06,'square',.55],[80,.04,.14,'square',.5],[110,.1,.28,'sawtooth',.4]],
  'Explosion':       [[80,0,.08,'square',.5],[60,.06,.2,'square',.5],[100,.16,.35,'sawtooth',.35]],
  'Bass Drop':       [[80,0,.05,'square',.5],[60,.04,.2,'square',.6],[40,.18,.45,'square',.5]],
  'Thunder':         [[60,0,.05,'sawtooth',.45],[45,.04,.15,'sawtooth',.5],[55,.13,.35,'square',.4]],
  'Hearts':          [[523,0,.1,'sine',.5],[659,.09,.2,'sine',.55],[523,.19,.3,'sine',.45]],
  'Gentle Ping':     [[659,0,.14,'sine',.55],[784,.12,.26,'sine',.5]],
  'Soft Chime':      [[784,0,.15,'sine',.4],[988,.13,.28,'sine',.38],[784,.26,.4,'sine',.35]],
  'Whoosh':          [[200,0,.18,'sawtooth',.3],[800,.1,.25,'sawtooth',.25]],
  'Airhorn':         [[233,0,.04,'square',.4],[185,.03,.25,'square',.5],[233,.24,.4,'square',.4]],
  'Laser':           [[1200,0,.15,'sawtooth',.3],[400,.08,.22,'sawtooth',.3]],
  'Xylophone':       [[880,0,.1,'sine',.55],[1047,.09,.19,'sine',.55],[1318,.18,.3,'sine',.5],[1047,.28,.38,'sine',.5]],
  'Notification':    [[880,0,.06,'sine',.6],[1047,.05,.12,'sine',.6]],
  'Tada':            [[523,0,.08,'sine',.5],[659,.06,.14,'sine',.55],[784,.12,.2,'sine',.6],[1047,.18,.35,'sine',.65]],
  'Cheer':           [[400,0,.05,'sawtooth',.25],[500,.04,.1,'sawtooth',.25],[600,.09,.18,'sawtooth',.3]],
  'Activation':      [[880,0,.05,'sine',.7],[1047,.04,.1,'sine',.8],[1318,.09,.16,'sine',.7]],
  'None':            []
};
const SOUND_NAMES = Object.keys(SOUNDS);

// ══════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════
const S = {
  isLive:false, isMuted:false, tiktokConnected:false,
  startTime:null, streamDuration:0, streamInterval:null,
  viewers:0, peakViewers:0,
  followsTonight:0, coinsTonight:0, giftsTonight:0, commentsTonight:0, likesTonight:0,
  topGifter:'', topGifterCoins:0, topCommenter:'', topCommenterCount:0,
  giftGoal:1000, giftGoalProgress:0, goalMilestonesHit:[],
  qaMode:false, safeMode:false, calmMode:false,
  toxicFilter:true, bleepProfanity:false, vcEnabled:false, autoTranslate:false,
  speechRate:1.0, voiceVolume:1.0, sfxVolume:1.0,
  selectedVoice:null, ttsProvider:'browser',
  elevenLabsKey:'', elevenLabsVoiceId:'',
  playHTKey:'', playHTUserId:'', playHTVoiceId:'',
  queue:[], isAnnouncing:false, lastText:'', lastType:'system',
  spamTracker:{}, viewerHistory:{}, giftStreaks:{}, giftStreakTimers:{},
  giftCounts:{}, commentCounts:{},
  viewerMilestones:new Set(), followMilestones:new Set(),
  activitySpike:[], silenceTimer:null, firstCommentDone:false,
  pollActive:false, pollResults:{yes:0,no:0}, pollTimer:null,
  fttActive:false, fttWord:'',
  giveawayActive:false, giveawayEntrants:new Set(),
  countdownTimer:null, audioCtx:null, reminderIntervals:[],
  translateCache:{}
};

// ══════════════════════════════════════════════════════════
// AUDIO ENGINE
// ══════════════════════════════════════════════════════════
const Audio = {
  init() {
    if (!S.audioCtx) S.audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    if (S.audioCtx.state==='suspended') S.audioCtx.resume();
  },
  playPreset(preset) {
    if (!preset?.length) return;
    try {
      this.init();
      const ctx=S.audioCtx;
      const master=ctx.createGain();
      master.gain.setValueAtTime(S.sfxVolume, ctx.currentTime);
      master.connect(ctx.destination);
      preset.forEach(([freq,start,end,wave,g])=>{
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.connect(gain); gain.connect(master);
        osc.type=wave;
        osc.frequency.setValueAtTime(freq, ctx.currentTime+start);
        gain.gain.setValueAtTime(g, ctx.currentTime+start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+end);
        osc.start(ctx.currentTime+start);
        osc.stop(ctx.currentTime+end+0.01);
      });
    } catch(_) {}
  },
  play(name) {
    if (!name||name==='None') return;
    if (SOUNDS[name]) { this.playPreset(SOUNDS[name]); return; }
    // Try as URL
    try {
      this.init();
      fetch(name).then(r=>r.arrayBuffer()).then(buf=>S.audioCtx.decodeAudioData(buf)).then(decoded=>{
        const src=S.audioCtx.createBufferSource();
        const gain=S.audioCtx.createGain();
        gain.gain.setValueAtTime(S.sfxVolume,S.audioCtx.currentTime);
        src.buffer=decoded; src.connect(gain); gain.connect(S.audioCtx.destination); src.start();
      }).catch(()=>this.play('Notification'));
    } catch(_) {}
  },
  playActivation() { this.play('Activation'); }
};

// ══════════════════════════════════════════════════════════
// SPEECH ENGINE — multi-provider TTS
// ══════════════════════════════════════════════════════════
const Speech = {
  voices:[],
  loadVoices() {
    // English voices only — sorted by quality (local/neural first)
    this.voices = speechSynthesis.getVoices()
      .filter(v => v.lang.startsWith('en'))
      .sort((a,b) => {
        // Local (higher quality) voices first
        if(a.localService && !b.localService) return -1;
        if(!a.localService && b.localService) return 1;
        return a.name.localeCompare(b.name);
      });
    const sel=el('voice-select');
    if (!sel||!this.voices.length) return;
    const saved=localStorage.getItem('tla-voice');
    sel.innerHTML=this.voices.map((v,i)=>{
      const star=v.localService?' ★':'';
      return `<option value="${i}" ${saved===v.name?'selected':''}>${v.name} — ${v.lang}${star}</option>`;
    }).join('');

    // Try to restore saved voice
    const savedIdx=this.voices.findIndex(v=>v.name===saved);
    if(savedIdx>=0){
      sel.value=savedIdx;
      S.selectedVoice=this.voices[savedIdx];
      return;
    }

    // Auto-select best quality voice — priority order
    const preferred = [
      // Microsoft Edge neural voices (highest quality, free)
      'Microsoft Ryan Online','Microsoft Sonia Online','Microsoft Libby Online',
      'Microsoft Aria Online','Microsoft Guy Online','Microsoft Jenny Online',
      'Microsoft Emma Online','Microsoft Brian Online','Microsoft Andrew Online',
      // Apple voices
      'Samantha','Daniel','Karen','Moira','Tessa',
      // Google voices
      'Google UK English Female','Google UK English Male',
      'Google US English','Google US English 2',
      // Any local English voice
    ];

    let best = null;
    // First try preferred list in order
    for (const name of preferred) {
      const v = this.voices.find(v => v.name.includes(name));
      if (v) { best = v; break; }
    }
    // Fall back to any local English voice
    if (!best) best = this.voices.find(v => v.localService && v.lang.startsWith('en'));
    // Fall back to any English voice
    if (!best) best = this.voices.find(v => v.lang.startsWith('en'));
    // Last resort — first available
    if (!best && this.voices.length) best = this.voices[0];

    if (best) {
      const idx = this.voices.indexOf(best);
      sel.value = idx;
      S.selectedVoice = best;
      localStorage.setItem('tla-voice', best.name);
    }
  },

  async speak(text, opts={}) {
    const vol = Math.min(1.0, opts.volume!==undefined ? opts.volume : S.voiceVolume);
    const rate = opts.rate!==undefined ? opts.rate : S.speechRate;
    // Try ElevenLabs first if key is set
    if (S.elevenLabsKey && S.elevenLabsVoiceId && S.ttsProvider==='elevenlabs') {
      const ok = await this.elevenLabsSpeak(text, opts);
      if (ok) return;
    }
    // Try PlayHT
    if (S.playHTKey && S.playHTVoiceId && S.ttsProvider==='playht') {
      const ok = await this.playHTSpeak(text, opts);
      if (ok) return;
    }
    // Fall back to browser
    this.browserSpeak(text, {rate, volume:vol, pitch:opts.pitch||1.0, onend:opts.onend});
  },

  browserSpeak(text, opts={}) {
    if (!window.speechSynthesis) { if(opts.onend) opts.onend(); return; }
    const u=new SpeechSynthesisUtterance(text);
    u.rate   = opts.rate   || S.speechRate;
    u.pitch  = opts.pitch  || 1.0;
    u.volume = Math.min(1.0, opts.volume!==undefined ? opts.volume : S.voiceVolume);
    if(S.selectedVoice) u.voice=S.selectedVoice;
    else {
      const en=speechSynthesis.getVoices().filter(v=>v.lang.startsWith('en'));
      if(en.length) u.voice=en[0];
    }
    if(opts.onend) u.onend=opts.onend;
    u.onerror=()=>{if(opts.onend)opts.onend();};
    speechSynthesis.speak(u);
  },

  async elevenLabsSpeak(text, opts={}) {
    try {
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${S.elevenLabsVoiceId}`, {
        method:'POST',
        headers:{'Accept':'audio/mpeg','Content-Type':'application/json','xi-api-key':S.elevenLabsKey},
        body:JSON.stringify({text,model_id:'eleven_monolingual_v1',voice_settings:{stability:.5,similarity_boost:.75}})
      });
      if (!resp.ok) return false;
      const blob=await resp.blob();
      const url=URL.createObjectURL(blob);
      const audio=new window.Audio(url);
      audio.volume=Math.min(1.0,S.voiceVolume);
      if(opts.onend) audio.onended=opts.onend;
      audio.play();
      return true;
    } catch(_) { return false; }
  },

  async playHTSpeak(text, opts={}) {
    try {
      const resp = await fetch('https://api.play.ht/api/v2/tts/stream', {
        method:'POST',
        headers:{'Authorization':`Bearer ${S.playHTKey}`,'X-User-ID':S.playHTUserId,'Content-Type':'application/json','Accept':'audio/mpeg'},
        body:JSON.stringify({text,voice:S.playHTVoiceId,output_format:'mp3',speed:S.speechRate})
      });
      if (!resp.ok) return false;
      const blob=await resp.blob();
      const url=URL.createObjectURL(blob);
      const audio=new window.Audio(url);
      audio.volume=Math.min(1.0,S.voiceVolume);
      if(opts.onend) audio.onended=opts.onend;
      audio.play();
      return true;
    } catch(_) { return false; }
  },

  cancel() { try{speechSynthesis.cancel();}catch(_){} }
};

// ══════════════════════════════════════════════════════════
// VOICE PICKER
// ══════════════════════════════════════════════════════════
const VoicePicker = {
  preview() {
    const sel=el('voice-select'); if(!sel) return;
    const v=Speech.voices[+sel.value]; if(!v) return;
    S.selectedVoice=v;
    localStorage.setItem('tla-voice',v.name);
    Speech.cancel();
    Speech.browserSpeak('Hi! This is how I will sound during your live stream. Welcome everyone!',{rate:S.speechRate,volume:1.0});
  }
};

// ══════════════════════════════════════════════════════════
// AUTO TRANSLATOR
// ══════════════════════════════════════════════════════════
const Translator = {
  cache:{},
  async translate(text) {
    if (!S.autoTranslate) return {translated:text, lang:'en', wasTranslated:false};
    if (this.cache[text]) return this.cache[text];
    try {
      const res = await fetch(`/api/translate?text=${encodeURIComponent(text)}&target=en`);
      const data = await res.json();
      const result = {
        translated: data.translated||text,
        lang: data.detected||'',
        wasTranslated: data.wasTranslated||false
      };
      this.cache[text] = result;
      if (Object.keys(this.cache).length > 200) {
        const first = Object.keys(this.cache)[0];
        delete this.cache[first];
      }
      return result;
    } catch(_) {
      return {translated:text, lang:'', wasTranslated:false};
    }
  }
};

// ══════════════════════════════════════════════════════════
// QUEUE ENGINE
// ══════════════════════════════════════════════════════════
const Queue = {
  add(text, type='system', priority=5, sound=null, opts={}) {
    if (S.isMuted && priority>1) return;
    if (S.calmMode && priority>3 && S.queue.some(i=>i.type===type)) return;
    const item={text,type,priority,sound,opts,id:Date.now()+Math.random()};
    let idx=S.queue.findIndex(i=>i.priority>priority);
    if(idx===-1) S.queue.push(item);
    else S.queue.splice(idx,0,item);
    if(S.calmMode&&S.queue.length>6) S.queue=S.queue.slice(0,6);
    UI.updateQueue();
    if(!S.isAnnouncing) this.next();
  },
  next() {
    if(!S.queue.length){S.isAnnouncing=false;UI.clearNP();return;}
    if(S.isMuted){S.queue=[];UI.updateQueue();UI.clearNP();return;}
    S.isAnnouncing=true;
    const item=S.queue.shift();
    UI.updateQueue(); UI.setNP(item);
    S.lastText=item.text; S.lastType=item.type;
    if(item.sound){Audio.play(item.sound);setTimeout(()=>this._speak(item),350);}
    else this._speak(item);
  },
  _speak(item) {
    const o=Object.assign({rate:S.speechRate,volume:S.voiceVolume},item.opts);
    o.onend=()=>{S.isAnnouncing=false;setTimeout(()=>this.next(),120);};
    Speech.speak(item.text,o);
  },
  clear(){S.queue=[];Speech.cancel();S.isAnnouncing=false;UI.updateQueue();UI.clearNP();}
};

// ══════════════════════════════════════════════════════════
// VOICE COMMANDS — confirmation flow
// ══════════════════════════════════════════════════════════
const VoiceCmd = {
  rec:null, state:'idle', pendingCmd:'', pendingAction:null,

  COMMANDS:{
    'skip':          ()=>App.skip(),
    'repeat':        ()=>App.repeatLast(),
    'mute':          ()=>{if(!S.isMuted)App.toggleMute();},
    'unmute':        ()=>{if(S.isMuted)App.toggleMute();},
    'stats':         ()=>App.readStats(),
    'how long':      ()=>{const m=Math.floor(S.streamDuration/60);Queue.add(`You have been live for ${m} minutes.`,'system',2);},
    'water':         ()=>App.waterBreak(),
    'water break':   ()=>App.waterBreak(),
    'panic':         ()=>App.panic(),
    'slow down':     ()=>App.setRate(Math.max(.5,S.speechRate-.25)),
    'speed up':      ()=>App.setRate(Math.min(2.5,S.speechRate+.25)),
    'earnings':      ()=>Queue.add(`You have earned ${S.coinsTonight.toLocaleString()} coins tonight.`,'system',2),
    'top gifter':    ()=>Queue.add(S.topGifter?`Top gifter: ${S.topGifter} with ${S.topGifterCoins.toLocaleString()} coins.`:'No gifts yet.','system',2),
    'qa mode':       ()=>App.setQA(!S.qaMode),
    'calm mode':     ()=>App.setCalm(!S.calmMode),
    'good night':    ()=>App.endStream(),
    'end stream':    ()=>App.endStream(),
  },

  init() {
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert('Voice commands need Chrome or Edge browser.');return false;}
    this.rec=new SR();
    this.rec.continuous=true; this.rec.interimResults=false; this.rec.lang='en-GB';
    this.rec.onresult=e=>{
      const t=e.results[e.results.length-1][0].transcript.toLowerCase().trim();
      this.handle(t);
    };
    this.rec.onerror=e=>{if(e.error!=='no-speech'){S.vcEnabled=false;el('vc-toggle').checked=false;UI.updateVoice();}};
    this.rec.onend=()=>{if(S.vcEnabled){try{this.rec.start();}catch(_){}}};
    return true;
  },
  start(){if(!this.rec&&!this.init())return;try{this.rec.start();}catch(_){}UI.updateVoice();},
  stop() {try{this.rec?.stop();}catch(_){}UI.updateVoice();},

  handle(text) {
    const wake=(g('set-wakeword')||'liveannouncer').toLowerCase().replace(/\s+/g,'');
    const clean=text.replace(/\s+/g,'');

    if (this.state==='idle') {
      if (clean.includes(wake)||text.includes('live announcer')) {
        this.activate();
      }
      return;
    }

    if (this.state==='listening') {
      this.pendingCmd=text;
      this.confirm(text);
      return;
    }

    if (this.state==='confirming') {
      if (text.includes('yes')||text.includes('yeah')||text.includes('confirm')||text.includes('do it')) {
        this.execute();
      } else if (text.includes('no')||text.includes('cancel')||text.includes('nope')) {
        this.cancel();
      }
      return;
    }
  },

  activate() {
    this.state='activated';
    el('vc-dot').className='vc-dot listening';
    el('vc-status').textContent='Listening for your command...';
    Audio.playActivation();
    setTimeout(()=>{
      Speech.browserSpeak("What would you like me to do?",{rate:1.0,volume:1.0,onend:()=>{
        this.state='listening';
        el('vc-status').textContent='Speak your command now...';
      }});
    },400);
  },

  confirm(cmd) {
    this.state='confirming';
    el('vc-dot').className='vc-dot confirming';
    el('vc-status').textContent=`Heard: "${cmd}" — say Yes or No`;
    Speech.browserSpeak(`I heard: ${cmd}. Is that what you want me to do?`,{rate:1.0,volume:1.0});
  },

  execute() {
    this.state='idle';
    el('vc-dot').className='vc-dot listening';
    el('vc-status').textContent='Say "LiveAnnouncer" to give a voice command';
    const cmd=this.pendingCmd;
    // Find matching command
    const match=Object.keys(this.COMMANDS).find(k=>cmd.includes(k));
    if (match) {
      Speech.browserSpeak('Done.',{rate:1.0,volume:1.0});
      this.COMMANDS[match]();
      UI.log('system','Voice Cmd',cmd,'🎤');
    } else if (cmd.includes('shoutout')) {
      const name=cmd.replace(/.*shoutout\s*/,'').trim();
      if(name){
        Speech.browserSpeak('Done.',{rate:1.0,volume:1.0});
        Queue.add(`Shoutout to the amazing ${name}! Go show them some love!`,'milestone',2,'Sparkle');
      }
    } else {
      Speech.browserSpeak("Sorry, I did not recognise that command. Please try again.",{rate:1.0,volume:1.0});
      this.state='idle';
    }
  },

  cancel() {
    this.state='idle';
    el('vc-dot').className='vc-dot listening';
    el('vc-status').textContent='Say "LiveAnnouncer" to give a voice command';
    Speech.browserSpeak("OK, cancelled.",{rate:1.0,volume:1.0});
  }
};

// ══════════════════════════════════════════════════════════
// SOUND MANAGER — per-event sounds
// ══════════════════════════════════════════════════════════
const SoundManager = {
  defaults:{ small:'Coin Chime', medium:'Sparkle', large:'Royal Fanfare',
             follow:'Bell Tower', like:'Hearts', share:'Notification',
             comment:'Pop', milestone:'Trumpet Fanfare', subscribe:'Grand Fanfare' },
  config:{},
  load() {
    try{this.config=JSON.parse(localStorage.getItem('tla-sounds-v3')||'{}');}catch(_){}
    this.buildEventSounds();
  },
  save(){localStorage.setItem('tla-sounds-v3',JSON.stringify(this.config));},
  get(key){return this.config[key]||this.defaults[key]||null;},
  set(key,val){this.config[key]=val;this.save();},
  buildEventSounds() {
    const container=el('event-sounds-container');
    if(!container) return;
    const events=[
      {key:'follow',   label:'➕ New Follow'},
      {key:'like',     label:'❤ Like / Heart Me'},
      {key:'share',    label:'📤 Share / Repost'},
      {key:'comment',  label:'💬 Comment'},
      {key:'small',    label:'🎁 Small Gift (fallback)'},
      {key:'medium',   label:'💝 Medium Gift (fallback)'},
      {key:'large',    label:'🏆 Large Gift (fallback)'},
      {key:'milestone',label:'🎉 Milestone'},
      {key:'subscribe',label:'⭐ Subscribe'}
    ];
    const opts=SOUND_NAMES.map(n=>`<option value="${n}">${n}</option>`).join('');
    container.innerHTML=events.map(ev=>{
      const cur=this.config[ev.key]||this.defaults[ev.key]||'None';
      return `<div class="esound-row">
        <span class="esound-label">${ev.label}</span>
        <select class="esound-sel" id="esnd-${ev.key}" onchange="SoundManager.set('${ev.key}',this.value)">${opts}</select>
        <button class="esound-test" onclick="Audio.play(SoundManager.get('${ev.key}'))">▶ Test</button>
      </div>`;
    }).join('');
    // Set current values
    events.forEach(ev=>{
      const sel=el(`esnd-${ev.key}`);
      if(sel) sel.value=this.config[ev.key]||this.defaults[ev.key]||'None';
    });
  }
};

// ══════════════════════════════════════════════════════════
// GIFT LIBRARY
// ══════════════════════════════════════════════════════════
const GiftLibrary = {
  gifts:[], sounds:{}, filter:'',
  async load() {
    try{this.sounds=JSON.parse(localStorage.getItem('tla-gift-sounds-v2')||'{}');}catch(_){}
    try{const r=await fetch('/api/gifts');this.gifts=await r.json();}catch(_){this.gifts=[];}
    this.render();
  },
  save(){localStorage.setItem('tla-gift-sounds-v2',JSON.stringify(this.sounds));},
  getSound(giftId,giftName,size){
    const id=(giftId||giftName||'').toLowerCase().replace(/[^a-z0-9]/g,'_');
    return this.sounds[id]||this.sounds[(giftName||'').toLowerCase()]||SoundManager.get(size)||null;
  },
  setSound(id,name){this.sounds[id]=name;this.save();},
  filter(text){this.filter=text.toLowerCase();this.render();},
  async refresh(){
    const btn=el('gift-refresh-btn');if(btn){btn.textContent='⏳...';btn.disabled=true;}
    try{
      const r=await fetch('/api/gifts/refresh');const d=await r.json();
      if(d.ok){const r2=await fetch('/api/gifts');this.gifts=await r2.json();this.render();
        Queue.add(`Gift list refreshed. ${d.added?d.added+' new gifts added.':'All up to date.'}`, 'system', 4);
      }
    }catch(_){}
    if(btn){btn.textContent='🔄 Refresh';btn.disabled=false;}
  },
  async learnGift(name,coins,emoji){
    try{
      const r=await fetch('/api/gifts/learn',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,coins,emoji})});
      const d=await r.json();
      if(d.learned){
        const id=name.toLowerCase().replace(/[^a-z0-9]/g,'_');
        this.gifts.push({id,name,coins,emoji:emoji||'🎁',learned:true});
        this.gifts.sort((a,b)=>a.coins-b.coins);
        this.render();
      }
    }catch(_){}
  },
  render(){
    const container=el('gift-grid');if(!container)return;
    const filtered=this.filter?this.gifts.filter(g=>g.name.toLowerCase().includes(this.filter)):this.gifts;
    if(!filtered.length){container.innerHTML=`<div style="color:var(--dim);padding:.75rem;font-size:.85rem">No gifts found.</div>`;return;}
    const opts=SOUND_NAMES.map(n=>`<option value="${n}">${n}</option>`).join('');
    container.innerHTML=filtered.map(g=>{
      const cur=this.sounds[g.id]||'None';
      return `<div class="gift-card">
        <div class="gift-emoji">${g.emoji}</div>
        <div class="gift-info">
          <div class="gift-name">${esc(g.name)}${g.learned?` <span class="gift-new">NEW</span>`:''}</div>
          <div class="gift-coins">🪙 ${g.coins.toLocaleString()}</div>
        </div>
        <div class="gift-controls">
          <select class="gift-sel" onchange="GiftLibrary.setSound('${g.id}',this.value)" aria-label="Sound for ${esc(g.name)}">
            ${SOUND_NAMES.map(n=>`<option value="${n}" ${n===cur?'selected':''}>${n}</option>`).join('')}
          </select>
          <button class="gift-test" onclick="Audio.play(GiftLibrary.sounds['${g.id}']||'None')">▶</button>
        </div>
      </div>`;
    }).join('');
  }
};

// ══════════════════════════════════════════════════════════
// DIAMOND GLOW
// ══════════════════════════════════════════════════════════
const DiamondGlow = {
  liveStatus:{},
  autoCheckInterval: null,

  init() {
    // Auto check every 30 seconds when modal is open or settings are open
    this.autoCheckInterval = setInterval(() => {
      // Only auto-check if the modal or settings panel is visible
      const modalVisible = !el('connect-modal').classList.contains('hidden');
      const settingsVisible = el('settings-panel').classList.contains('open');
      if (modalVisible || settingsVisible) {
        this._check('dg-modal-list');
        this._check('dg-grid');
      }
    }, 30000);
  },

  render(containerId) {
    const c=el(containerId); if(!c) return;
    c.innerHTML=DIAMOND_GLOW.map(m=>{
      const status=this.liveStatus[m.handle];
      const dotClass=status===true?'live':status===false?'offline':status==='checking'?'checking':'';
      const badge=status===true?'<span class="dg-live-tag">LIVE</span>':'';
      if(containerId==='dg-modal-list'){
        return `<div class="dg-modal-item" onclick="TikTok.selectMember('${m.handle}')">
          <span class="dg-modal-dot ${dotClass}"></span>
          <span class="dg-modal-name">${m.name}</span>
          ${badge}
        </div>`;
      }
      return `<div class="dg-row" onclick="TikTok.selectMember('${m.handle}')">
        <span class="dg-dot ${dotClass}"></span>
        <span class="dg-name">${m.name}</span>
        <span class="dg-handle">@${m.handle}</span>
        ${badge}
      </div>`;
    }).join('');
  },

  async checkLive() {
    const btn=el('dg-check-btn');
    if(btn){btn.textContent='⏳ Checking...';btn.disabled=true;}
    await this._check('dg-grid');
    await this._check('dg-modal-list');
    if(btn){btn.textContent='🔄 Check Who Is Live';btn.disabled=false;}
    const live=DIAMOND_GLOW.filter(m=>this.liveStatus[m.handle]===true);
    if(live.length){
      const names=live.map(m=>m.name).join(', ');
      Speech.speak(`${live.length} Diamond Glow member${live.length>1?'s are':' is'} live right now: ${names}`,{rate:S.speechRate,volume:1.0});
    } else {
      Speech.speak('No Diamond Glow members appear to be live right now.',{rate:S.speechRate,volume:1.0});
    }
  },

  async checkLiveModal() {
    const btn=el('dg-modal-check');
    if(btn){btn.textContent='⏳...';btn.disabled=true;}
    await this._check('dg-modal-list');
    await this._check('dg-grid');
    if(btn){btn.textContent='🔄 Check Live';btn.disabled=false;}
  },

  async _check(renderId) {
    DIAMOND_GLOW.forEach(m => this.liveStatus[m.handle] = 'checking');
    this.render(renderId);

    // Use TikTool REST API if we have a key — most reliable
    const apiKey = localStorage.getItem('tla-tiktool-key') || '';

    const checks = DIAMOND_GLOW.map(async m => {
      try {
        if (apiKey) {
          // TikTool REST API — checks if user is live
          const res = await fetch(
            `https://api.tik.tools/v1/is-live?uniqueId=${encodeURIComponent(m.handle)}&apiKey=${encodeURIComponent(apiKey)}`,
            { signal: AbortSignal.timeout(6000) }
          );
          if (res.ok) {
            const data = await res.json();
            this.liveStatus[m.handle] = data.isLive === true || data.live === true || data.status === 'live';
            return;
          }
        }
        // Fallback — allorigins CORS proxy
        const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.tiktok.com/@${m.handle}/live`)}`;
        const res2 = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res2.ok) {
          const data = await res2.json();
          const html = data.contents || '';
          this.liveStatus[m.handle] =
            html.includes('"isLive":true') ||
            html.includes('"liveStatus":1') ||
            html.includes('liveRoomUserInfo');
        } else {
          this.liveStatus[m.handle] = false;
        }
      } catch(_) {
        this.liveStatus[m.handle] = false;
      }
    });

    // Check in batches of 4 to avoid hammering APIs
    for (let i = 0; i < DIAMOND_GLOW.length; i += 4) {
      await Promise.all(checks.slice(i, i + 4));
    }
    this.render(renderId);
  }
};

// ══════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════
const Settings = {
  load() {
    try {
      const d=JSON.parse(localStorage.getItem('tla-v6')||'{}');
      if(d.name)        el('set-name').value=d.name;
      if(d.wakeWord)    el('set-wakeword').value=d.wakeWord;
      if(d.water)       el('set-water').value=d.water;
      if(d.followNudge) el('set-follow-nudge').value=d.followNudge;
      if(d.socials)     el('set-socials').value=d.socials;
      if(d.posture)     el('set-posture').value=d.posture;
      if(d.viewerT)     el('set-viewers-timer').value=d.viewerT;
      if(d.earnings)    el('set-earnings').value=d.earnings;
      if(d.goal)        {el('set-goal').value=d.goal;S.giftGoal=+d.goal;}
      if(d.small)       el('set-small').value=d.small;
      if(d.medium)      el('set-medium').value=d.medium;
      if(d.large)       el('set-large').value=d.large;
      if(d.rate)        App.setRate(d.rate);
      if(d.vol!=null)   App.setVolume(d.vol*100);
      if(d.sfx!=null)   App.setSfxVolume(d.sfx*100);
    }catch(_){}
    Nicknames.load(); Keywords.load(); Loyalty.load();
    SoundManager.load(); GiftLibrary.load();
    DiamondGlow.render('dg-grid'); DiamondGlow.render('dg-modal-list');
    this.updateGoal();
  },
  save() {
    localStorage.setItem('tla-v6',JSON.stringify({
      name:g('set-name'), wakeWord:g('set-wakeword'),
      water:+g('set-water'), followNudge:+g('set-follow-nudge'),
      socials:+g('set-socials'), posture:+g('set-posture'),
      viewerT:+g('set-viewers-timer'), earnings:+g('set-earnings'),
      goal:+g('set-goal'), small:+g('set-small'), medium:+g('set-medium'), large:+g('set-large'),
      rate:S.speechRate, vol:S.voiceVolume, sfx:S.sfxVolume
    }));
  },
  saveGoal(){S.giftGoal=+g('set-goal')||1000;this.save();this.updateGoal();},
  updateGoal(){
    if(!S.giftGoal){el('goal-label').textContent='Set a goal in Settings';el('goal-pct').textContent='';el('goal-fill').style.width='0%';return;}
    const pct=Math.min(100,Math.round((S.giftGoalProgress/S.giftGoal)*100));
    el('goal-label').textContent=`${S.giftGoalProgress.toLocaleString()} / ${S.giftGoal.toLocaleString()} coins`;
    el('goal-fill').style.width=pct+'%';
    el('goal-pct').textContent=pct+'%';
  },
  reset(){if(!confirm('Reset ALL settings?'))return;['tla-v6','tla-wizard','tla-nicks','tla-kw','tla-loyalty','tla-sounds-v3','tla-gift-sounds-v2','tla-voice','tla-sessionid','tla-elkey','tla-phkey','tla-phuser','tla-saved-users'].forEach(k=>localStorage.removeItem(k));location.reload();}
};

// ══════════════════════════════════════════════════════════
// EVENTS
// ══════════════════════════════════════════════════════════
const Events = {
  async comment(username, rawText) {
    S.commentsTonight++;
    el('s-comments')&&(el('s-comments').textContent=S.commentsTonight);

    if(S.toxicFilter&&TOXIC_WORDS.some(w=>rawText.toLowerCase().includes(w))){
      UI.log('system',username,'Skipped: inappropriate comment','🚫');return;
    }
    let text=rawText;
    if(S.bleepProfanity) PROFANITY.forEach(w=>{text=text.replace(new RegExp(w,'gi'),'****');});

    // Spam filter
    const key=text.toLowerCase().trim().slice(0,40);
    S.spamTracker[key]=(S.spamTracker[key]||0)+1;
    if(S.spamTracker[key]>3) return;
    setTimeout(()=>delete S.spamTracker[key],25000);

    // Top commenter
    S.commentCounts[username]=(S.commentCounts[username]||0)+1;
    if(S.commentCounts[username]>S.topCommenterCount){S.topCommenterCount=S.commentCounts[username];S.topCommenter=username;el('top-commenter').textContent=`${username} (${S.topCommenterCount})`;}

    // Silence timer
    clearTimeout(S.silenceTimer);
    S.silenceTimer=setTimeout(()=>Queue.add('Chat has gone quiet — good time to ask your audience a question!','system',7),60000);

    // Auto-translate
    const tr=await Translator.translate(text);
    const displayText=tr.translated;
    const langNote=tr.wasTranslated?` (${tr.lang})`:' ';

    // Keyword trigger
    const kwReply=Keywords.check(displayText.toLowerCase());
    if(kwReply){Queue.add(kwReply,'comment',5,SoundManager.get('comment'));UI.log('comment',username,rawText,'💬');return;}

    // Nickname
    const nick=Nicknames.get(username);
    if(nick){Queue.add(nick,'comment',4,SoundManager.get('comment'));UI.log('comment',username,rawText,'👋');return;}

    // First comment
    if(!S.firstCommentDone){
      S.firstCommentDone=true;
      Queue.add(`First comment tonight goes to ${username} — they say: ${displayText}`,'milestone',2,SoundManager.get('milestone'));
      UI.log('milestone',username,`FIRST: ${rawText}`,'⭐');UI.flash('green');return;
    }

    // Question
    if(displayText.includes('?')&&en('en-questions')&&!S.safeMode){
      const msg=tr.wasTranslated?`Question in ${tr.lang} from ${username}: ${displayText}`:`Question from ${username}: ${displayText}`;
      Queue.add(msg,'question',3,SoundManager.get('comment'),{pitch:1.1});
      UI.log('question',username,rawText,'❓');return;
    }

    // Shoutout
    if(/\bso\b/.test(displayText.toLowerCase())||displayText.toLowerCase().includes('shoutout')){
      Queue.add(`Shoutout request from ${username}!`,'comment',4,SoundManager.get('comment'));
      UI.log('comment',username,`Shoutout: ${rawText}`,'📢');return;
    }

    // Poll / FTT / Giveaway
    if(S.pollActive){const l=displayText.toLowerCase().trim();if(l==='yes')S.pollResults.yes++;else if(l==='no')S.pollResults.no++;}
    if(S.fttActive&&S.fttWord&&displayText.toLowerCase().includes(S.fttWord.toLowerCase())){
      S.fttActive=false;
      Queue.add(`We have a winner! ${username} was first to type ${S.fttWord}!`,'milestone',1,SoundManager.get('milestone'));
      UI.log('game',username,'Won First To Type!','🏆');el('game-status').textContent=`Winner: ${username}`;UI.flash('green');return;
    }
    if(S.giveawayActive) S.giveawayEntrants.add(username);
    if(S.safeMode||S.qaMode||!en('en-comments')) return;

    // Activity spike
    S.activitySpike.push(Date.now());
    S.activitySpike=S.activitySpike.filter(t=>Date.now()-t<5000);
    if(S.activitySpike.length>=8){S.activitySpike=[];Queue.add('Something just set chat off — that could be a highlight moment!','system',5);UI.log('system','System','📍 Highlight!','📍');}

    const msg=tr.wasTranslated
      ?`${username} says in ${tr.lang}: ${displayText}`
      :`${username} says: ${displayText}`;
    Queue.add(msg,'comment',7,SoundManager.get('comment'));
    UI.log('comment',username,tr.wasTranslated?`${rawText} → ${displayText}`:rawText,'💬');
  },

  follow(username){
    if(!en('en-follows'))return;
    S.followsTonight++;
    el('s-follows').textContent=S.followsTonight;
    el('tb-follows').textContent=S.followsTonight;
    const hist=S.viewerHistory[username]||{visits:0};
    S.viewerHistory[username]={visits:hist.visits+1,lastSeen:Date.now()};
    Loyalty.check(username,hist.visits+1);
    const msg=hist.visits>0?`Welcome back ${username}! Great to see you again!`:`New follower! Welcome to the family, ${username}!`;
    Queue.add(msg,'follow',3,SoundManager.get('follow'),{pitch:1.1});
    UI.log('follow',username,hist.visits>0?'Returned':'New follow','➕');
    UI.flash('green');
    [10,25,50,100,250,500].forEach(m=>{
      if(S.followsTonight>=m&&!S.followMilestones.has(m)&&en('en-milestones')){
        S.followMilestones.add(m);
        Queue.add(`You just gained your ${m}th follow tonight! Amazing, thank you all!`,'milestone',2,SoundManager.get('milestone'));
        UI.log('milestone','System',`${m} follows!`,'🎉');UI.flash('green');
      }
    });
  },

  like(username,count){
    S.likesTonight+=count||1;
    el('s-likes').textContent=S.likesTonight;
    if(!en('en-likes')) return;
    Audio.play(SoundManager.get('like'));
    if(S.likesTonight%50===0){
      Queue.add(`${S.likesTonight.toLocaleString()} likes tonight! Thank you so much!`,'like',6,null);
    }
    UI.log('like',username,`❤ Liked`,'❤');
  },

  gift(username,giftName,coins,emoji,repeatCount){
    if(!en('en-gifts'))return;
    S.coinsTonight+=coins; S.giftsTonight++;
    el('s-coins').textContent=S.coinsTonight.toLocaleString();
    el('tb-coins').textContent=S.coinsTonight.toLocaleString();
    el('s-gifts').textContent=S.giftsTonight;

    S.giftCounts[username]=(S.giftCounts[username]||0)+coins;
    if(S.giftCounts[username]>S.topGifterCoins){S.topGifterCoins=S.giftCounts[username];S.topGifter=username;el('top-gifter').textContent=`${username} (${S.topGifterCoins.toLocaleString()} coins)`;}

    const prev=S.giftStreaks[username];
    if(prev&&prev.gift===giftName){prev.count++;clearTimeout(S.giftStreakTimers[username]);}
    else S.giftStreaks[username]={gift:giftName,count:repeatCount||1};
    S.giftStreakTimers[username]=setTimeout(()=>delete S.giftStreaks[username],10000);
    const streak=S.giftStreaks[username].count;

    S.giftGoalProgress+=coins;
    this.checkGoal(); Settings.updateGoal();

    const small=+g('set-small')||100, medium=+g('set-medium')||1000, large=+g('set-large')||5000;
    const size=coins>=large?'large':coins>=medium?'medium':'small';

    // Auto-learn
    const gid=giftName.toLowerCase().replace(/[^a-z0-9]/g,'_');
    if(!GiftLibrary.gifts.find(g=>g.id===gid||g.name.toLowerCase()===giftName.toLowerCase())){
      GiftLibrary.learnGift(giftName,coins,emoji||'🎁');
    }

    const sound=GiftLibrary.getSound(gid,giftName,size);
    let msg,priority,opts={};
    if(size==='large'){
      msg=streak>1?`Oh my goodness! ${username} is on a ${streak} times streak of ${giftName}! That is absolutely incredible!`:`Oh my goodness! ${username} just sent a ${giftName}! That is incredible, thank you so much!`;
      priority=1;opts={pitch:.88,rate:S.speechRate*.9};
      UI.flash('gold');setTimeout(()=>UI.flash('gold'),350);
    }else if(size==='medium'){
      msg=streak>1?`${username} is on a ${streak} streak of ${giftName}! Amazing!`:`Wow! ${username} sent a ${giftName}, thank you so much!`;
      priority=2;opts={pitch:1.05};UI.flash('gold');
    }else{
      msg=streak>1?`${username} is on a ${streak} ${giftName} streak!`:`${username} sent a ${giftName}, thank you!`;
      priority=4;
    }
    Queue.add(msg,'gift',priority,sound,opts);
    UI.log('gift',username,`${emoji||'🎁'} ${giftName} (${coins.toLocaleString()} coins)${streak>1?` — ${streak}× streak!`:''}`,emoji||'🎁');
  },

  share(username){
    if(!en('en-shares'))return;
    Queue.add(`${username} just shared your stream — absolute legend, thank you!`,'share',4,SoundManager.get('share'),{pitch:1.1});
    UI.log('share',username,'Shared the stream','📤');
  },

  subscribe(username){
    Queue.add(`${username} just subscribed! Welcome to the family!`,'milestone',3,SoundManager.get('subscribe'),{pitch:1.15});
    UI.log('subscribe',username,'New subscriber!','⭐');UI.flash('gold');
  },

  viewers(count){
    S.viewers=count;
    if(count>S.peakViewers)S.peakViewers=count;
    el('s-viewers').textContent=count;
    el('tb-viewers').textContent=count;
    [10,25,50,100,250,500,1000].forEach(m=>{
      if(count>=m&&!S.viewerMilestones.has(m)&&en('en-milestones')){
        S.viewerMilestones.add(m);
        Queue.add(`Incredible! You just hit ${m.toLocaleString()} viewers!`,'milestone',2,SoundManager.get('milestone'));
        UI.log('milestone','System',`${m} viewers!`,'🎉');UI.flash('green');
      }
    });
  },

  checkGoal(){
    if(!S.giftGoal)return;
    const pct=(S.giftGoalProgress/S.giftGoal)*100;
    [25,50,75,100].forEach(m=>{
      if(pct>=m&&!S.goalMilestonesHit.includes(m)){
        S.goalMilestonesHit.push(m);
        const msg=m===100?`Goal reached! You hit ${S.giftGoal.toLocaleString()} coins tonight! Incredible!`:`You are now ${m}% toward your gift goal!`;
        Queue.add(msg,'milestone',m===100?1:3,m===100?SoundManager.get('milestone'):SoundManager.get('small'));
        if(m===100){UI.flash('gold');UI.flash('gold');}
      }
    });
  }
};

// ══════════════════════════════════════════════════════════
// LOYALTY, NICKNAMES, KEYWORDS
// ══════════════════════════════════════════════════════════
const Loyalty={
  data:{},tiers:[{v:50,n:'Legend'},{v:25,n:'Gold Regular'},{v:10,n:'Silver Regular'},{v:3,n:'Bronze Regular'}],
  load(){try{this.data=JSON.parse(localStorage.getItem('tla-loyalty')||'{}');}catch(_){}},
  save(){localStorage.setItem('tla-loyalty',JSON.stringify(this.data));},
  check(username,visits){
    const prev=this.data[username]||0;const prevT=this.tiers.find(t=>prev>=t.v);const newT=this.tiers.find(t=>visits>=t.v);
    if(newT&&(!prevT||newT.n!==prevT.n)){Queue.add(`${username} just became a ${newT.n}! They have been here ${visits} times!`,'milestone',3,SoundManager.get('milestone'));UI.log('milestone',username,`Tier: ${newT.n}!`,'🏆');}
    this.data[username]=visits;this.save();
  }
};
const Nicknames={
  data:{},
  load(){try{this.data=JSON.parse(localStorage.getItem('tla-nicks')||'{}');}catch(_){}this.render();},
  add(){const u=el('nick-user').value.trim().toLowerCase(),gv=el('nick-greeting').value.trim();if(!u||!gv)return;this.data[u]=gv;localStorage.setItem('tla-nicks',JSON.stringify(this.data));el('nick-user').value='';el('nick-greeting').value='';this.render();},
  remove(u){delete this.data[u];localStorage.setItem('tla-nicks',JSON.stringify(this.data));this.render();},
  get(un){return this.data[un.toLowerCase()]||null;},
  render(){el('nicknames-list').innerHTML=Object.entries(this.data).map(([u,gv])=>`<span class="tag" onclick="Nicknames.remove('${u}')">${esc(u)}: "${esc(gv)}" ✕</span>`).join('');}
};
const Keywords={
  defaults:{'first time':"Welcome to your first stream, so glad you are here!",'hello':"Hey there, welcome in!",'love you':"Love you too, thank you!",'how are you':"I am doing amazing, thank you for asking!"},
  data:{},
  load(){try{this.data=JSON.parse(localStorage.getItem('tla-kw')||'{}');}catch(_){}if(!Object.keys(this.data).length)this.data={...this.defaults};this.render();},
  add(){const t=el('kw-trigger').value.trim().toLowerCase(),r=el('kw-response').value.trim();if(!t||!r)return;this.data[t]=r;localStorage.setItem('tla-kw',JSON.stringify(this.data));el('kw-trigger').value='';el('kw-response').value='';this.render();},
  remove(t){delete this.data[t];localStorage.setItem('tla-kw',JSON.stringify(this.data));this.render();},
  check(text){return this.data[Object.keys(this.data).find(k=>text.includes(k))]||null;},
  render(){el('keywords-list').innerHTML=Object.entries(this.data).map(([t,r])=>`<span class="tag" onclick="Keywords.remove('${esc(t)}')">"${esc(t)}" ✕</span>`).join('');}
};

// ══════════════════════════════════════════════════════════
// REMINDERS
// ══════════════════════════════════════════════════════════
const Reminders={
  start(){
    this.stop();if(!en('en-reminders'))return;
    const add=(fn,mins)=>{S.reminderIntervals.push(setInterval(fn,mins*60000));};
    add(()=>Queue.add("Hey, have you had some water? Take a sip!",'system',7,null,{volume:1.0}),+g('set-water')||20);
    add(()=>Queue.add("Don't forget to ask viewers to hit that follow button!",'system',7,null,{volume:1.0}),+g('set-follow-nudge')||15);
    add(()=>Queue.add("Good time to mention your other social media!",'system',7,null,{volume:1.0}),+g('set-socials')||25);
    add(()=>Queue.add("Quick posture check! Sit up straight and take a breath.",'system',8,null,{volume:.9}),+g('set-posture')||45);
    add(()=>Queue.add(`Stats: ${S.viewers} viewers, ${S.followsTonight} follows, ${S.coinsTonight.toLocaleString()} coins.`,'system',6),+g('set-viewers-timer')||5);
    add(()=>Queue.add(`Earnings: ${S.coinsTonight.toLocaleString()} coins.${S.topGifter?` Top gifter: ${S.topGifter}.`:''}`,'system',6),+g('set-earnings')||10);
    S.reminderIntervals.push(setInterval(()=>{const m=Math.floor(S.streamDuration/60),h=Math.floor(m/60),min=m%60;const dur=h>0?`${h} hours and ${min} minutes`:`${m} minutes`;Queue.add(`You have been live for ${dur}.`,'system',8,null,{volume:.85});},30*60000));
  },
  stop(){S.reminderIntervals.forEach(clearInterval);S.reminderIntervals=[];}
};

// ══════════════════════════════════════════════════════════
// GAMES
// ══════════════════════════════════════════════════════════
const Games={
  poll(){const q=prompt('Poll question:');if(!q)return;S.pollActive=true;S.pollResults={yes:0,no:0};Queue.add(`Poll time! ${q} — type YES or NO in chat!`,'milestone',2,SoundManager.get('milestone'));el('game-status').textContent=`Poll (30s): ${q}`;clearTimeout(S.pollTimer);S.pollTimer=setTimeout(()=>{S.pollActive=false;const tot=S.pollResults.yes+S.pollResults.no;if(tot){const yp=Math.round((S.pollResults.yes/tot)*100);Queue.add(`Poll: ${yp}% yes, ${100-yp}% no from ${tot} votes!`,'milestone',2,SoundManager.get('milestone'));}else Queue.add('Poll ended with no votes.','system',5);el('game-status').textContent=`Poll ended — Yes:${S.pollResults.yes} No:${S.pollResults.no}`;},30000);},
  firstToType(){const w=prompt('What word should they type?');if(!w)return;S.fttActive=true;S.fttWord=w;Queue.add(`First to type ${w} wins a shoutout!`,'milestone',2,SoundManager.get('milestone'));el('game-status').textContent=`Waiting for: "${w}"`;},
  startGiveaway(){S.giveawayActive=true;S.giveawayEntrants=new Set();Queue.add('Giveaway active! Everyone commenting is entered to win!','milestone',2,SoundManager.get('milestone'));el('game-status').textContent='Giveaway active';const t=setInterval(()=>{if(!S.giveawayActive){clearInterval(t);return;}el('game-status').textContent=`Giveaway — ${S.giveawayEntrants.size} entrants`;},2000);},
  pickWinner(){const ents=[...S.giveawayEntrants];S.giveawayActive=false;if(!ents.length){Queue.add('No entrants yet!','system',4);return;}const w=ents[Math.floor(Math.random()*ents.length)];Queue.add('Drumroll please...','system',2,SoundManager.get('small'));setTimeout(()=>{Queue.add(`And the winner is... ${w}! Congratulations!`,'milestone',1,SoundManager.get('milestone'),{pitch:1.2});el('game-status').textContent=`Winner: ${w}`;UI.flash('gold');},2500);},
  wheel(){const raw=prompt('Wheel options (comma separated):');if(!raw)return;const opts=raw.split(',').map(s=>s.trim()).filter(Boolean);if(opts.length<2)return;Queue.add('The wheel is spinning...','system',3,SoundManager.get('small'));let ticks=0;const iv=setInterval(()=>{Audio.play('Notification');ticks++;if(ticks>=20){clearInterval(iv);const r=opts[Math.floor(Math.random()*opts.length)];setTimeout(()=>{Queue.add(`The wheel has landed on... ${r}!`,'milestone',1,SoundManager.get('milestone'));el('game-status').textContent=`Wheel: ${r}`;},500);}},120+ticks*10);},
  countdown(){const mins=+(prompt('Count down from how many minutes?','5')||0);if(!mins)return;let secs=mins*60;Queue.add(`Starting a ${mins} minute countdown!`,'system',3);el('game-status').textContent=`Countdown: ${mins}:00`;clearInterval(S.countdownTimer);const marks=[300,180,120,60,30,10,9,8,7,6,5,4,3,2,1];S.countdownTimer=setInterval(()=>{secs--;const m=Math.floor(secs/60),s=secs%60;el('game-status').textContent=`${m}:${String(s).padStart(2,'0')}`;if(marks.includes(secs)){if(secs>60)Queue.add(`${m} minutes remaining!`,'system',6);else if(secs>10)Queue.add(`${secs} seconds!`,'system',4);else if(secs>0)Queue.add(`${secs}!`,'system',2,null,{rate:1.5});else{Queue.add('Time is up! Go go go!','milestone',1,SoundManager.get('milestone'));clearInterval(S.countdownTimer);el('game-status').textContent='Done!';}}},1000);},
  stop(){S.pollActive=S.fttActive=S.giveawayActive=false;clearTimeout(S.pollTimer);clearInterval(S.countdownTimer);el('game-status').textContent='Stopped';Queue.add('All games stopped.','system',5);}
};

// ══════════════════════════════════════════════════════════
// TIKTOK CONNECTION — via TikTool WebSocket API
// Connects directly from browser to tik.tools
// Bypasses server IP blocking completely
// ══════════════════════════════════════════════════════════
const TikTok = {
  ws: null,
  pingInterval: null,
  reconnectTimer: null,
  currentUsername: '',
  _apiKey: '',
  _username: '',

  showConnectModal() {
    el('connect-modal').classList.remove('hidden');
    el('modal-err').textContent = '';
    el('modal-username').value = '';
    // Pre-fill saved API key
    const savedKey = localStorage.getItem('tla-tiktool-key') || '';
    if (savedKey) el('modal-apikey').value = savedKey;
    DiamondGlow.render('dg-modal-list');
    this.renderSaved();
    setTimeout(() => el('modal-username').focus(), 100);
    el('modal-username').onkeydown = e => { if(e.key==='Enter') el('modal-apikey').focus(); };
    el('modal-apikey').onkeydown   = e => { if(e.key==='Enter') TikTok.connect(); };
  },

  closeModal() { el('connect-modal').classList.add('hidden'); Speech.cancel(); },
  selectMember(handle) { el('modal-username').value = handle; el('modal-username').focus(); },

  connect() {
    const username = el('modal-username').value.trim().replace('@','');
    const apiKey   = el('modal-apikey').value.trim();
    if (!username) { el('modal-err').textContent = 'Please enter a username.'; return; }
    if (!apiKey)   { el('modal-err').textContent = 'Please enter your TikTool API key.'; return; }
    localStorage.setItem('tla-tiktool-key', apiKey);
    this.saveUsername(username);
    this.currentUsername = username;
    this.doConnect(username, apiKey);
  },

  doConnect(username, apiKey) {
    el('modal-err').textContent = 'Connecting...';
    Speech.speak(`Connecting to ${username}'s live stream. Please wait.`);
    UI.log('system','TikTok',`Connecting to @${username}...`,'🔄');

    // Close any existing connection
    if (this.ws) { try { this.ws.close(); } catch(_) {} this.ws = null; }
    if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }

    const url = `wss://api.tik.tools?uniqueId=${encodeURIComponent(username)}&apiKey=${encodeURIComponent(apiKey)}`;
    const ws = new WebSocket(url);
    this.ws = ws;
    this._apiKey = apiKey;
    this._username = username;

    ws.onopen = () => {
      console.log('[TikTool] Connected');
      // Send keep-alive ping every 10 seconds to prevent idle disconnect
      this.pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try { ws.send(JSON.stringify({ type: 'ping' })); } catch(_) {}
        }
      }, 10000);
    };

    ws.onmessage = (raw) => {
      try {
        const msg = JSON.parse(raw.data);
        const d = msg.data || {};
        const user = d.user?.uniqueId || d.uniqueId || 'Someone';

        switch (msg.event) {
          case 'roomInfo':
            if (!S.tiktokConnected) {
              S.tiktokConnected = true;
              TikTok.closeModal();
              el('btn-connect').textContent = '🔴 DISCONNECT';
              el('btn-connect').classList.add('live');
              el('live-dot').classList.add('on');
              el('live-label').textContent = 'LIVE';
              App.goLive();
              Queue.add(`Connected to ${username}'s TikTok live stream!`, 'system', 2, SoundManager.get('milestone'));
              UI.log('system','TikTok',`Connected to @${username}`,'✅');
            }
            break;

          case 'chat':
            Events.comment(user, d.comment || '');
            break;

          case 'gift':
            if (d.isFinal !== false) {
              Events.gift(user, d.giftName || 'Gift', d.diamondCount || 0, '🎁', d.repeatCount || 1);
            }
            break;

          case 'social':
          case 'follow':
            Events.follow(user);
            break;

          case 'share':
            Events.share(user);
            break;

          case 'subscribe':
            Events.subscribe(user);
            break;

          case 'like':
            Events.like(user, d.likeCount || 1);
            break;

          case 'roomUserSeq':
          case 'roomUser':
            if (d.viewerCount) Events.viewers(d.viewerCount);
            break;

          case 'streamEnd':
            TikTok.handleDisconnect('Stream has ended.');
            break;

          case 'pong':
          case 'ping':
            break; // keep-alive response — ignore

          case 'error':
            const errMsg = d.message || msg.message || 'Connection error.';
            console.error('[TikTool] Error:', errMsg);
            UI.log('alert','TikTok', errMsg,'⚠');
            break;
        }
      } catch(e) { console.error('[TikTool] Parse error:', e); }
    };

    ws.onerror = (e) => {
      console.error('[TikTool] WebSocket error');
      UI.log('alert','TikTok','WebSocket error','⚠');
    };

    ws.onclose = (e) => {
      console.log('[TikTool] Closed, code:', e.code, 'reason:', e.reason);
      if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }

      if (S.tiktokConnected) {
        // Was connected — try to auto-reconnect after 3 seconds
        UI.log('system','TikTok','Connection dropped — reconnecting in 3 seconds...','🔄');
        Queue.add('Connection dropped. Reconnecting in 3 seconds.','alert',2);
        setTimeout(() => {
          if (S.tiktokConnected || !S.isLive) return; // already reconnected or stream ended
          UI.log('system','TikTok','Reconnecting...','🔄');
          TikTok.doConnect(this._username, this._apiKey);
        }, 3000);
      } else if (e.code === 4001 || e.code === 4003) {
        el('modal-err').textContent = 'Invalid API key. Check your TikTool API key and try again.';
      } else if (e.code === 4004) {
        el('modal-err').textContent = 'Stream not found or not live. Make sure the stream is already live.';
      } else if (e.code !== 1000 && e.code !== 1001) {
        el('modal-err').textContent = 'Connection failed. Make sure the stream is live and try again.';
      }
    };
  },

  handleDisconnect(reason) {
    S.tiktokConnected = false;
    this.ws = null;
    el('btn-connect').textContent = '🔴 CONNECT TO TIKTOK';
    el('btn-connect').classList.remove('live');
    el('live-dot').classList.remove('on');
    el('live-label').textContent = 'OFFLINE';
    Queue.add(`Disconnected. ${reason}`, 'alert', 2);
    UI.log('alert','TikTok', reason,'❌');
  },

  disconnect() {
    if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }
    if (this.ws) { try { this.ws.close(1000); } catch(_) {} this.ws = null; }
    this.handleDisconnect('Disconnected manually.');
  },

  saveUsername(u) {
    let saved = JSON.parse(localStorage.getItem('tla-saved-users') || '[]');
    saved = saved.filter(x => x !== u); saved.unshift(u); saved = saved.slice(0,8);
    localStorage.setItem('tla-saved-users', JSON.stringify(saved));
  },
  removeSaved(u) {
    let saved = JSON.parse(localStorage.getItem('tla-saved-users') || '[]');
    saved = saved.filter(x => x !== u);
    localStorage.setItem('tla-saved-users', JSON.stringify(saved));
    this.renderSaved();
  },
  renderSaved() {
    const saved = JSON.parse(localStorage.getItem('tla-saved-users') || '[]');
    const box = el('saved-box'), list = el('saved-chips');
    if (!saved.length) { box.style.display='none'; return; }
    box.style.display = 'block';
    list.innerHTML = saved.map(u =>
      `<span class="saved-chip" onclick="TikTok.selectMember('${esc(u)}')">@${esc(u)}<span class="saved-chip-x" onclick="event.stopPropagation();TikTok.removeSaved('${esc(u)}')">✕</span></span>`
    ).join('');
  }
};

// ══════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════
const App={
  goLive(){
    if(S.isLive)return;
    S.isLive=true;S.startTime=Date.now();
    el('live-dot').classList.add('on');el('live-label').textContent='LIVE';
    S.streamInterval=setInterval(()=>{
      S.streamDuration++;
      const h=Math.floor(S.streamDuration/3600),m=Math.floor((S.streamDuration%3600)/60),s=S.streamDuration%60;
      el('stream-timer').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      el('s-time').textContent=h>0?`${h}h${String(m).padStart(2,'0')}m`:`${m}m`;
    },1000);
    Reminders.start();
  },
  preStreamChecklist(){
    Queue.add("Quick pre-stream check. Mic on. Water nearby. Battery charged. You are ready. Have an amazing stream!",'system',10,null,{rate:.92,volume:1.0});
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
  setTranslate(val){
    S.autoTranslate=val;
    el('translate-badge').style.display=val?'inline-block':'none';
    Queue.add(val?'Auto-translate is on. Non-English comments will be translated.':'Auto-translate is off.','system',4);
  },
  setVoiceCommands(val){
    S.vcEnabled=val;
    if(val){VoiceCmd.start();Queue.add(`Voice commands active. Say ${g('set-wakeword')||'LiveAnnouncer'} to give a command.`,'system',3);}
    else{VoiceCmd.stop();}
  },
  skip(){Speech.cancel();S.isAnnouncing=false;setTimeout(()=>Queue.next(),100);},
  repeatLast(){if(S.lastText)Queue.add(S.lastText,S.lastType,2);},
  readStats(){const m=Math.floor(S.streamDuration/60);Queue.add(`Stats: ${S.viewers} viewers, ${S.followsTonight} follows, ${S.coinsTonight.toLocaleString()} coins, live for ${m} minutes.${S.topGifter?` Top gifter: ${S.topGifter}.`:''}`,'system',2);},
  waterBreak(){Queue.clear();Queue.add("Taking a quick water break — back in a moment!",'system',1,null,{volume:1.0});setTimeout(()=>{if(!S.isMuted)Queue.add('Water break over — back and ready to go!','system',1);},5*60000);},
  panic(){
    Queue.clear();S.isMuted=false;
    Audio.play('Double Alert');
    Speech.browserSpeak('Stream paused safely. You are okay. Take your time. Breathe.',{rate:.82,pitch:.9,volume:1.0,onend:()=>{S.isMuted=true;el('mute-btn').textContent='🔇 MUTED — TAP TO UNMUTE';el('mute-btn').classList.add('muted');}});
    UI.log('alert','PANIC','⚠ Panic — muted','🚨');UI.flash('red');
  },
  endStream(){
    if(!confirm('End stream and hear your summary?'))return;
    Reminders.stop();S.isLive=false;clearInterval(S.streamInterval);Queue.clear();
    const m=Math.floor(S.streamDuration/60),h=Math.floor(m/60),mins=m%60;
    const dur=h>0?`${h} hours and ${mins} minutes`:`${m} minutes`;
    const summary=`Tonight was a fantastic stream. You were live for ${dur}. You gained ${S.followsTonight} new followers. You earned approximately ${S.coinsTonight.toLocaleString()} coins. ${S.topGifter?`Top gifter was ${S.topGifter} with ${S.topGifterCoins.toLocaleString()} coins. `:''}${S.topCommenter?`Most active chatter was ${S.topCommenter}. `:''}Peak viewers was ${S.peakViewers}. You did an incredible job. Rest up and see you next time.`;
    Speech.speak(summary,{rate:.9,volume:1.0});
    UI.log('system','Ended',summary,'🔴');
    el('live-dot').classList.remove('on');el('live-label').textContent='ENDED';
    el('btn-connect').textContent='🔴 CONNECT TO TIKTOK';el('btn-connect').classList.remove('live');
    if(S.tiktokConnected) TikTok.disconnect();
  },
  handleKey(e){
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
    switch(e.key.toLowerCase()){
      case 'm':this.toggleMute();break;
      case 's':this.skip();break;
      case 'r':this.repeatLast();break;
      case 'p':this.panic();break;
      case 'q':{const nv=!S.qaMode;el('qa-toggle').checked=nv;this.setQA(nv);}break;
      case 'c':{const nv=!S.calmMode;el('calm-toggle').checked=nv;this.setCalm(nv);}break;
      case '-':this.setRate(Math.max(.5,S.speechRate-.1));break;
      case '=':case '+':this.setRate(Math.min(2.5,S.speechRate+.1));break;
    }
  }
};

// ══════════════════════════════════════════════════════════
// TEST BUTTONS
// ══════════════════════════════════════════════════════════
const Test={
  comment()    {Events.comment(rand(FAKE_USERS),rand(FAKE_COMMENTS));},
  question()   {Events.comment(rand(FAKE_USERS),'What headset do you use for streaming?');},
  giftSmall()  {const g=FAKE_GIFTS[2];Events.gift('TestFan',g.n,g.c,g.e,1);},
  giftMedium() {const g=FAKE_GIFTS[6];Events.gift('TestFan',g.n,g.c,g.e,1);},
  giftLarge()  {const g=FAKE_GIFTS[9];Events.gift('VIPFan',g.n,g.c,g.e,1);},
  follow()     {Events.follow('NewFan'+Math.floor(Math.random()*99));},
  like()       {Events.like(rand(FAKE_USERS),5);},
  share()      {Events.share('ShareLegend');},
  milestone()  {Events.viewers(100);},
  streak()     {[1,2,3].forEach((_,i)=>setTimeout(()=>Events.gift('StreakFan','Rose',1,'🌹',i+1),i*400));},
  returnViewer(){S.viewerHistory['OldFriend']={visits:5,lastSeen:Date.now()-86400000};Events.follow('OldFriend');}
};

// ══════════════════════════════════════════════════════════
// UI
// ══════════════════════════════════════════════════════════
const UI={
  log(type,username,text,icon){
    const c=el('log-container');
    const t=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const d=document.createElement('div');d.className='log-entry new';
    d.innerHTML=`<span class="log-time">${t}</span><span class="log-badge lb-${type}">${type}</span><span class="log-text"><span class="un">${esc(username)}</span> — ${esc(text)}</span>`;
    c.appendChild(d);c.scrollTop=c.scrollHeight;
    setTimeout(()=>d.classList.remove('new'),500);
  },
  clearLog(){el('log-container').innerHTML='';},
  setNP(item){
    el('np-type').textContent=item.type.toUpperCase();el('np-type').className='now-type '+item.type;
    el('np-text').textContent=item.text;
    const bar=el('np-bar');bar.style.transition='none';bar.style.width='100%';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.transition='width 4s linear';bar.style.width='0%';}));
  },
  clearNP(){el('np-type').textContent='IDLE';el('np-type').className='now-type';el('np-text').textContent='Waiting for events...';el('np-bar').style.width='0%';},
  updateQueue(){
    const n=S.queue.length;
    el('tb-queue').textContent=n;
    el('queue-preview').textContent=n>0?`Next: ${S.queue[0].text.slice(0,40)}…`:'';
  },
  updateVoice(){
    el('voice-dot').className='voice-dot'+(S.vcEnabled?' on':'');
    el('voice-label').textContent=S.vcEnabled?'MIC ON':'MIC OFF';
  },
  flash(color){const o=el('flash-overlay');o.className=`flash-overlay ${color} show`;setTimeout(()=>o.classList.remove('show'),700);},
  openSettings(){
    const p=el('settings-panel'),o=el('settings-overlay');
    p.classList.remove('hidden');o.classList.remove('hidden');
    setTimeout(()=>p.classList.add('open'),10);
  },
  closeSettings(){
    const p=el('settings-panel'),o=el('settings-overlay');
    p.classList.remove('open');
    setTimeout(()=>{p.classList.add('hidden');o.classList.add('hidden');},300);
  }
};

// ══════════════════════════════════════════════════════════
// SETUP WIZARD
// ══════════════════════════════════════════════════════════
const Wizard={
  step:0,ans:{},
  steps:[
    {id:'name',type:'text',q:"Welcome to LiveAnnouncer — created by RB and Claude AI. Built for accessibility. What is your streamer name?",placeholder:'Your name',def:'Streamer'},
    {id:'rate',type:'opts',q:"How fast would you like announcements read?",opts:[{l:'Slow',v:.8},{l:'Normal',v:1.0},{l:'Fast',v:1.2},{l:'Very Fast',v:1.5}],def:1.0},
    {id:'toxic',type:'opts',q:"Should we skip abusive or hateful comments so you never hear them?",opts:[{l:'Yes — protect me',v:true},{l:'No — read everything',v:false}],def:true},
    {id:'translate',type:'opts',q:"Auto-translate non-English comments into English?",opts:[{l:'Yes please',v:true},{l:'No thanks',v:false}],def:false},
    {id:'goal',type:'text',q:"What is your coin goal for tonight? Enter a number, or 0 for no goal.",placeholder:'e.g. 5000',def:'1000'},
    {id:'vc',type:'opts',q:"Enable voice commands? Say LiveAnnouncer to activate, then give your command hands-free. Needs Chrome or Edge.",opts:[{l:'Yes please',v:true},{l:'No thanks',v:false}],def:false},
    {id:'done',type:'finish',q:"All set! Open Settings to customise voices and sounds. Press Connect to TikTok when you are live. Enjoy your stream!"}
  ],
  start(){el('app').classList.add('hidden');el('wizard').classList.remove('hidden');this.step=0;this.ans={};this.render();},
  render(){
    const s=this.steps[this.step],total=this.steps.length;
    el('wiz-dots').innerHTML=Array.from({length:total},(_,i)=>`<div class="wiz-dot${i<=this.step?' on':''}"></div>`).join('');
    el('wiz-step').textContent=`Step ${this.step+1} of ${total}`;
    setTimeout(()=>{Speech.browserSpeak(s.q,{rate:1.0,volume:1.0});el('wiz-speaking').textContent='🔊 Speaking...';setTimeout(()=>el('wiz-speaking').textContent='',3500);},200);
    const c=el('wiz-content');
    c.innerHTML=`<p class="wiz-text">${s.q}</p>`;
    if(s.type==='text'){
      c.innerHTML+=`<input type="text" class="wiz-inp" id="wiz-inp" placeholder="${s.placeholder}" value="${s.def||''}"><button class="wiz-btn" onclick="Wizard.next()">Next →</button>`;
      setTimeout(()=>{const inp=document.getElementById('wiz-inp');if(inp){inp.focus();inp.addEventListener('keydown',e=>{if(e.key==='Enter')Wizard.next();});}},100);
    }else if(s.type==='opts'){
      c.innerHTML+=`<div class="wiz-opts">${s.opts.map(o=>`<button class="wiz-opt" data-val='${JSON.stringify(o.v)}' onclick="Wizard.pick(this,'${s.id}',this.dataset.val)">${o.l}</button>`).join('')}</div><button class="wiz-btn" onclick="Wizard.next()">Next →</button>`;
      const def=s.opts.find(o=>o.v===s.def);
      if(def)setTimeout(()=>{document.querySelectorAll('.wiz-opt').forEach(b=>{if(b.textContent===def.l){b.classList.add('on');this.ans[s.id]=s.def;}});},50);
    }else{
      c.innerHTML+=`<button class="wiz-btn" onclick="Wizard.finish()">🚀 Launch LiveAnnouncer!</button>`;
    }
  },
  pick(btn,id,valStr){document.querySelectorAll('.wiz-opt').forEach(b=>b.classList.remove('on'));btn.classList.add('on');try{this.ans[id]=JSON.parse(valStr);}catch(_){this.ans[id]=valStr;}},
  next(){const s=this.steps[this.step];if(s.type==='text'){const inp=document.getElementById('wiz-inp');this.ans[s.id]=(inp?inp.value.trim():'')||s.def;}this.step++;if(this.step>=this.steps.length){this.finish();return;}this.render();},
  finish(){
    const a=this.ans;
    if(a.name)el('set-name').value=a.name;
    if(a.rate)App.setRate(a.rate);
    if(a.toxic!==undefined){S.toxicFilter=a.toxic;el('toxic-toggle').checked=a.toxic;}
    if(a.translate){S.autoTranslate=true;el('translate-toggle').checked=true;el('translate-badge').style.display='inline-block';}
    if(a.goal){el('set-goal').value=a.goal;Settings.saveGoal();}
    Settings.save();
    localStorage.setItem('tla-wizard','done');
    el('wizard').classList.add('hidden');el('app').classList.remove('hidden');
    setTimeout(()=>{
      Speech.speak(`Welcome ${a.name||'Streamer'}! LiveAnnouncer is ready. Open Settings to choose your voice and customise sounds. Press Connect to TikTok when you are live. Created by RB and Claude AI. Enjoy your stream!`,{rate:S.speechRate,volume:1.0});
      UI.log('system','System','🟢 LiveAnnouncer ready!','🟢');
      if(a.vc)setTimeout(()=>{el('vc-toggle').checked=true;App.setVoiceCommands(true);},4000);
    },300);
  }
};

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
function el(id){return document.getElementById(id);}
function g(id){return el(id)?.value||'';}
function en(id){return el(id)?.checked!==false;}
function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  // Load voices (retry as browsers load async)
  const lv=()=>Speech.loadVoices();
  lv();
  if(speechSynthesis.onvoiceschanged!==undefined) speechSynthesis.onvoiceschanged=lv;
  setTimeout(lv,500); setTimeout(lv,1500); setTimeout(lv,3000);

  document.addEventListener('keydown',e=>App.handleKey(e));
  Settings.load();

  // Battery monitoring
  if(navigator.getBattery){navigator.getBattery().then(bat=>{const check=()=>{if(bat.level<.2&&!bat.charging)Queue.add(`Battery at ${Math.round(bat.level*100)}%. Please plug in soon.`,'alert',2,'Alert Beep');};bat.addEventListener('levelchange',check);setInterval(check,5*60000);});}

  if(!localStorage.getItem('tla-wizard')){
    Wizard.start();
  }else{
    el('wizard').classList.add('hidden');el('app').classList.remove('hidden');
    setTimeout(()=>{
      Speech.speak('LiveAnnouncer is ready. Press Connect to TikTok to go live.',{rate:1.0,volume:1.0});
      UI.log('system','System','🟢 LiveAnnouncer ready!','🟢');
    },500);
  }

  // Start Diamond Glow auto-checker
  DiamondGlow.init();
  // Do first check after 3 seconds
  setTimeout(() => DiamondGlow._check('dg-grid').then(() => DiamondGlow._check('dg-modal-list')), 3000);
});
