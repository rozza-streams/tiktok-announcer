/* ═══════════════════════════════════════════════════════════
   TIKTOK LIVE ANNOUNCER — STYLESHEET
   Dark terminal aesthetic, accessibility-first
═══════════════════════════════════════════════════════════ */

:root {
  --bg:        #050a08;
  --surface:   #0a1410;
  --surface2:  #0f1e18;
  --border:    #1a3025;
  --border2:   #243d30;
  --green:     #00e87a;
  --green-dim: #00a855;
  --green-dk:  #003d20;
  --gold:      #ffc107;
  --gold-dim:  #b38600;
  --blue:      #00aaff;
  --blue-dim:  #0066cc;
  --red:       #ff4444;
  --red-dim:   #cc2222;
  --purple:    #cc88ff;
  --orange:    #ff8800;
  --text:      #e0f5ea;
  --text2:     #8aad99;
  --text3:     #4d7060;
  --mono:      'Share Tech Mono', monospace;
  --ui:        'Exo 2', sans-serif;
  --radius:    8px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--ui);
  font-size: 15px;
  overflow: hidden;
}

/* ── SCROLLBAR ───────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

/* ── FLASH OVERLAY ───────────────────────────────────────── */
.flash-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 900;
  opacity: 0; transition: opacity 0.3s;
}
.flash-overlay.flash-gold { background: radial-gradient(circle, rgba(255,193,7,.18) 0%, transparent 70%); }
.flash-overlay.flash-green { background: radial-gradient(circle, rgba(0,232,122,.14) 0%, transparent 70%); }
.flash-overlay.flash-red   { background: radial-gradient(circle, rgba(255,68,68,.22) 0%, transparent 70%); }
.flash-overlay.active { opacity: 1; }

/* ── WIZARD ──────────────────────────────────────────────── */
#wizard {
  position: fixed; inset: 0; background: var(--bg); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
}
#wizard.hidden { display: none; }

.wizard-box {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  max-width: 580px;
  width: 100%;
  text-align: center;
}
.wizard-logo { font-size: 3rem; margin-bottom: .5rem; }
.wizard-title { font-size: 1.8rem; font-weight: 700; color: var(--green); }
.wizard-subtitle { font-family: var(--mono); font-size: .8rem; color: var(--text3); margin-bottom: 1.5rem; }
.wizard-progress { display: flex; gap: 8px; justify-content: center; margin-bottom: 1rem; }
.wiz-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border2); transition: background .3s; }
.wiz-dot.active { background: var(--green); }
.wizard-step-label { font-family: var(--mono); font-size: .7rem; color: var(--text3); margin-bottom: 1rem; }
.wizard-speaking { font-family: var(--mono); font-size: .8rem; color: var(--green-dim); min-height: 1.1rem; margin-bottom: .75rem; }
.wizard-text { font-size: 1.05rem; line-height: 1.7; color: var(--text); margin-bottom: 1.25rem; }
.wizard-input {
  width: 100%; background: var(--bg); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: .75rem 1rem; font-size: 1rem;
  color: var(--text); font-family: var(--ui); margin-bottom: .75rem;
}
.wizard-input:focus { outline: 2px solid var(--green); }
.wizard-options { display: flex; flex-wrap: wrap; gap: .6rem; justify-content: center; margin-bottom: 1.25rem; }
.wiz-opt {
  background: var(--surface2); border: 2px solid var(--border2);
  border-radius: 10px; padding: .65rem 1.25rem; font-size: .95rem;
  font-family: var(--ui); color: var(--text); cursor: pointer; transition: all .15s;
}
.wiz-opt:hover, .wiz-opt.selected { border-color: var(--green); color: var(--green); background: var(--green-dk); }
.wizard-btn {
  background: var(--green); color: #000; border: none;
  border-radius: 10px; padding: .85rem 2.5rem;
  font-size: 1.05rem; font-weight: 700; font-family: var(--ui);
  cursor: pointer; transition: background .15s;
}
.wizard-btn:hover { background: #00ff88; }

/* ── APP LAYOUT ──────────────────────────────────────────── */
#app { display: grid; grid-template-rows: 56px 1fr 170px; height: 100vh; }
#app.hidden { display: none; }

/* ── TOP BAR ─────────────────────────────────────────────── */
#topbar {
  background: var(--surface); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 .75rem; gap: .5rem; overflow: hidden;
}
.tb-left  { display: flex; align-items: center; gap: .5rem; }
.tb-center { display: flex; align-items: center; gap: .75rem; }
.tb-right  { display: flex; align-items: center; gap: .5rem; }

.btn-connect {
  background: var(--green); color: #000; border: none;
  border-radius: var(--radius); padding: .45rem 1rem;
  font-size: .85rem; font-weight: 700; font-family: var(--ui); cursor: pointer;
  white-space: nowrap;
}
.btn-connect:hover { background: #00ff88; }
.btn-connect.live { background: var(--red); color: #fff; }

.live-pill { display: flex; align-items: center; gap: 5px; }
.live-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--border2); flex-shrink: 0;
}
.live-dot.on { background: var(--red); animation: blink 1.2s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }

#live-label { font-family: var(--mono); font-size: .75rem; color: var(--text2); }
#stream-timer { font-family: var(--mono); font-size: 1rem; color: var(--green); letter-spacing: 2px; }

.sim-badge {
  background: var(--orange); color: #000;
  font-family: var(--mono); font-size: .65rem; font-weight: 700;
  padding: 2px 7px; border-radius: 4px;
}
.sim-badge.hidden { display: none; }

.tb-stat { display: flex; flex-direction: column; align-items: center; min-width: 46px; }
.tb-val { font-family: var(--mono); font-size: .95rem; font-weight: 700; color: var(--text); }
.tb-val.green { color: var(--green); }
.tb-val.gold  { color: var(--gold); }
.tb-lbl { font-size: .58rem; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; }

.voice-indicator { display: flex; align-items: center; gap: 4px; font-family: var(--mono); font-size: .65rem; color: var(--text3); }
.voice-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border2); }
.voice-dot.on { background: var(--red); animation: blink .8s infinite; }

.btn-panic {
  background: var(--red); color: #fff; border: none;
  border-radius: var(--radius); padding: .45rem .9rem;
  font-size: .85rem; font-weight: 700; font-family: var(--ui); cursor: pointer;
  animation: panic-pulse 2s infinite;
  white-space: nowrap;
}
@keyframes panic-pulse { 0%,100%{box-shadow:0 0 6px #ff444450} 50%{box-shadow:0 0 18px #ff4444aa} }
.btn-panic:hover { background: #ff2222; }

/* ── MAIN GRID ───────────────────────────────────────────── */
#main { display: grid; grid-template-columns: 255px 1fr 225px; overflow: hidden; }

/* ── PANELS ──────────────────────────────────────────────── */
#panel-left, #panel-right {
  background: var(--surface); overflow-y: auto; padding: .6rem;
  display: flex; flex-direction: column; gap: .4rem;
}
#panel-left  { border-right: 1px solid var(--border); }
#panel-right { border-left:  1px solid var(--border); }

.panel-section { margin-bottom: .25rem; }
.section-title {
  font-family: var(--mono); font-size: .62rem; color: var(--text3);
  text-transform: uppercase; letter-spacing: 2px;
  padding: 3px 0 6px; border-bottom: 1px solid var(--border); margin-bottom: 5px;
}

/* Now Playing */
#now-playing-box {
  background: var(--surface2); border: 1px solid var(--border2);
  border-radius: 10px; padding: .65rem; min-height: 70px;
}
.np-type {
  font-family: var(--mono); font-size: .6rem; text-transform: uppercase;
  letter-spacing: 2px; margin-bottom: 4px; color: var(--text3);
}
.np-type.comment  { color: var(--green); }
.np-type.question { color: var(--purple); }
.np-type.gift     { color: var(--gold); }
.np-type.follow   { color: var(--blue); }
.np-type.milestone{ color: var(--purple); }
.np-type.alert    { color: var(--red); }
.np-type.system   { color: var(--text3); }

.np-text { font-size: .85rem; line-height: 1.5; color: var(--text); }
.np-bar  { height: 2px; background: var(--border); border-radius: 1px; margin-top: 7px; overflow: hidden; }
.np-bar-fill { height: 100%; background: var(--green); border-radius: 1px; width: 0%; transition: width 0s; }

/* Queue */
.queue-item {
  background: var(--surface2); border-radius: 5px;
  padding: .3rem .5rem; font-size: .75rem; color: var(--text2);
  display: flex; gap: 5px; align-items: flex-start; margin-bottom: 3px;
}
.qi-badge {
  font-family: var(--mono); font-size: .55rem; padding: 1px 4px;
  border-radius: 3px; background: var(--border2); color: var(--text3);
  flex-shrink: 0; margin-top: 1px;
}
.qi-badge.gift   { background: var(--gold-dim); color: #000; }
.qi-badge.follow { background: var(--blue-dim); color: #fff; }

/* Stats grid */
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.stat-box  { background: var(--surface2); border-radius: var(--radius); padding: .45rem .5rem; text-align: center; }
.stat-val  { font-family: var(--mono); font-size: 1rem; font-weight: 700; color: var(--text); }
.stat-val.green { color: var(--green); }
.stat-val.gold  { color: var(--gold); }
.stat-val.blue  { color: var(--blue); }
.stat-lbl  { font-size: .58rem; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-top: 1px; }

/* Goal */
.goal-label { font-family: var(--mono); font-size: .7rem; color: var(--text2); margin-bottom: 4px; }
.goal-bar   { background: var(--border); border-radius: 3px; height: 7px; overflow: hidden; margin-bottom: 3px; }
.goal-fill  { height: 100%; background: linear-gradient(90deg, var(--green-dim), var(--green)); border-radius: 3px; transition: width .6s; width: 0%; }
.goal-pct   { font-family: var(--mono); font-size: .65rem; color: var(--text3); }

.info-line { font-family: var(--mono); font-size: .75rem; color: var(--text2); padding: 2px 0; }

/* Mute button */
.mute-btn {
  width: 100%; background: var(--surface2); border: 2px solid var(--border2);
  border-radius: 10px; padding: .65rem; font-size: .9rem; font-weight: 700;
  font-family: var(--ui); color: var(--text); cursor: pointer; text-align: center;
  margin-bottom: 8px; transition: all .15s;
}
.mute-btn:hover { border-color: var(--green); }
.mute-btn.muted { background: #1a0000; border-color: var(--red); color: var(--red); }

/* Sliders */
.slider-row { display: flex; align-items: center; gap: 6px; }
.slider-row input[type=range] { flex: 1; accent-color: var(--green); }
input[type=range] { accent-color: var(--green); }
.key-hint { font-family: var(--mono); font-size: .65rem; color: var(--text3); }

/* Toggles */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 0; border-bottom: 1px solid var(--border);
}
.toggle-label { font-size: .78rem; color: var(--text2); }
.toggle { position: relative; width: 34px; height: 18px; flex-shrink: 0; }
.toggle input { display: none; }
.tog-slider {
  position: absolute; inset: 0; background: var(--border2);
  border-radius: 9px; cursor: pointer; transition: background .2s;
}
.tog-slider::before {
  content:''; position: absolute; width: 12px; height: 12px;
  background: var(--text3); border-radius: 50%; top: 3px; left: 3px; transition: all .2s;
}
.toggle input:checked + .tog-slider { background: var(--green-dk); }
.toggle input:checked + .tog-slider::before { transform: translateX(16px); background: var(--green); }

/* Control buttons */
.ctrl-btn {
  width: 100%; background: var(--surface2); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: .48rem .6rem; font-size: .78rem;
  font-family: var(--ui); color: var(--text); cursor: pointer;
  text-align: left; transition: all .15s; margin-bottom: 4px; display: block;
}
.ctrl-btn:hover { border-color: var(--green); color: var(--green); }
.ctrl-btn.active { background: var(--green-dk); border-color: var(--green); color: var(--green); }
.ctrl-btn.danger { border-color: var(--red-dim); color: var(--red); }
.ctrl-btn.danger:hover { background: #1a0000; }

.hotkey-grid { font-size: .7rem; color: var(--text3); font-family: var(--mono); line-height: 1.9; }

kbd {
  background: var(--border2); color: var(--text2);
  padding: 1px 5px; border-radius: 3px;
  font-family: var(--mono); font-size: .68rem;
}

/* ── CENTER — EVENT LOG ──────────────────────────────────── */
#center { background: var(--bg); overflow-y: auto; padding: .6rem; display: flex; flex-direction: column; }
.log-header {
  font-family: var(--mono); font-size: .62rem; color: var(--text3);
  text-transform: uppercase; letter-spacing: 2px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 3px 0 8px; border-bottom: 1px solid var(--border); margin-bottom: 6px;
  flex-shrink: 0;
}
.clear-btn {
  background: none; border: none; color: var(--text3); font-family: var(--mono);
  font-size: .62rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;
}
.clear-btn:hover { color: var(--red); }

.log-entry {
  display: flex; gap: 6px; padding: 4px 5px; border-radius: 5px;
  font-size: .82rem; line-height: 1.45; transition: background .2s;
}
.log-entry:hover { background: var(--surface); }
.log-entry.new { animation: flash-in .4s ease; }
@keyframes flash-in { from { background: var(--green-dk); } to { background: transparent; } }

.log-time { font-family: var(--mono); font-size: .62rem; color: var(--text3); flex-shrink: 0; padding-top: 2px; width: 42px; }
.log-badge {
  font-family: var(--mono); font-size: .58rem; padding: 2px 5px;
  border-radius: 3px; flex-shrink: 0; margin-top: 2px; height: fit-content;
  text-transform: uppercase;
}
.log-badge.comment   { background: var(--green-dk); color: var(--green); }
.log-badge.question  { background: #220044; color: var(--purple); }
.log-badge.gift      { background: var(--gold-dim); color: #000; }
.log-badge.follow    { background: var(--blue-dim); color: #fff; }
.log-badge.share     { background: var(--blue-dim); color: #fff; }
.log-badge.milestone { background: #220044; color: var(--purple); }
.log-badge.system    { background: var(--border); color: var(--text3); }
.log-badge.alert     { background: var(--red-dim); color: #fff; }
.log-badge.game      { background: #003355; color: var(--blue); }
.log-badge.subscribe { background: var(--gold-dim); color: #000; }

.log-text { color: var(--text); flex: 1; }
.log-text .un { color: var(--green); font-weight: 600; }
.log-text .gn { color: var(--gold); }

/* ── BOTTOM TABS ─────────────────────────────────────────── */
#bottombar {
  background: var(--surface); border-top: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden;
}
.tab-bar { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.tab {
  padding: .42rem 1.1rem; font-size: .78rem; font-family: var(--mono);
  color: var(--text3); cursor: pointer; border: none; background: none;
  border-bottom: 2px solid transparent; transition: all .15s;
}
.tab:hover { color: var(--text2); }
.tab.active { color: var(--green); border-bottom-color: var(--green); }

.tab-pane { display: none; flex: 1; overflow: auto; padding: .6rem .8rem; }
.tab-pane.active { display: flex; gap: .75rem; align-items: flex-start; }

/* Button grids */
.btn-grid { display: flex; flex-wrap: wrap; gap: 5px; align-items: flex-start; }
.tbtn {
  background: var(--surface2); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: .38rem .85rem;
  font-size: .78rem; font-family: var(--ui); color: var(--text);
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.tbtn:hover { border-color: var(--green); color: var(--green); }
.tbtn.gold   { border-color: var(--gold-dim); color: var(--gold); }
.tbtn.blue   { border-color: var(--blue-dim); color: var(--blue); }
.tbtn.purple { border-color: #6600aa; color: var(--purple); }
.tbtn.red    { border-color: var(--red-dim); color: var(--red); }

/* Settings grid */
.settings-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: .5rem; width: 100%; }
.settings-group { background: var(--surface2); border-radius: var(--radius); padding: .5rem .65rem; }
.sg-title { font-family: var(--mono); font-size: .6rem; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
.set-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 2px 0; font-size: .76rem; color: var(--text2);
}
.mini-in {
  background: var(--bg); border: 1px solid var(--border2); border-radius: 4px;
  padding: 2px 6px; font-size: .72rem; color: var(--text); font-family: var(--mono);
  width: 58px;
}
.mini-in:focus { outline: 1px solid var(--green); }

/* Game status */
.game-status {
  font-family: var(--mono); font-size: .78rem; color: var(--text2);
  padding: .4rem .75rem; background: var(--surface2);
  border-radius: var(--radius); align-self: flex-start; white-space: nowrap;
}

/* KV form (nicknames / keywords) */
.kv-form { display: flex; gap: 6px; flex-shrink: 0; }
.kv-input {
  background: var(--bg); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: .38rem .65rem;
  font-size: .8rem; color: var(--text); font-family: var(--ui); min-width: 0;
}
.kv-input:focus { outline: 1px solid var(--green); }
.kv-input.flex { flex: 1; }
.kv-btn {
  background: var(--green-dk); border: 1px solid var(--green-dim);
  border-radius: var(--radius); padding: .38rem .85rem;
  font-size: .8rem; color: var(--green); font-family: var(--ui); cursor: pointer;
  white-space: nowrap;
}
.kv-btn:hover { background: var(--green); color: #000; }

.tag-list { display: flex; flex-wrap: wrap; gap: 5px; align-content: flex-start; }
.tag {
  background: var(--surface2); border: 1px solid var(--border2);
  border-radius: 5px; padding: 2px 8px; font-size: .72rem;
  color: var(--text2); cursor: pointer;
}
.tag:hover { border-color: var(--red); color: var(--red); }

/* ── TIKTOK CONNECT MODAL ────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 800;
  display: flex; align-items: center; justify-content: center;
}
.modal-overlay.hidden { display: none; }
.modal-box {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: 14px; padding: 2rem; width: 400px; max-width: 90vw;
  text-align: center;
}
.modal-title { font-size: 1.2rem; font-weight: 700; color: var(--green); margin-bottom: .5rem; }
.modal-sub { font-size: .85rem; color: var(--text2); margin-bottom: 1.25rem; line-height: 1.6; }
.modal-input {
  width: 100%; background: var(--bg); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: .7rem 1rem; font-size: 1rem;
  color: var(--text); font-family: var(--ui); margin-bottom: .75rem;
}
.modal-input:focus { outline: 2px solid var(--green); }
.modal-btns { display: flex; gap: .5rem; justify-content: center; }
.modal-btn-go {
  background: var(--green); color: #000; border: none;
  border-radius: var(--radius); padding: .65rem 1.5rem;
  font-size: .95rem; font-weight: 700; font-family: var(--ui); cursor: pointer;
}
.modal-btn-go:hover { background: #00ff88; }
.modal-btn-cancel {
  background: var(--surface2); color: var(--text2); border: 1px solid var(--border2);
  border-radius: var(--radius); padding: .65rem 1.5rem;
  font-size: .95rem; font-family: var(--ui); cursor: pointer;
}
.modal-error { font-family: var(--mono); font-size: .8rem; color: var(--red); margin-top: .5rem; min-height: 1.1rem; }

/* ── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 900px) {
  #main { grid-template-columns: 220px 1fr; }
  #panel-right { display: none; }
  .settings-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  #main { grid-template-columns: 1fr; }
  #panel-left { display: none; }
  .settings-grid { grid-template-columns: 1fr; }
}
