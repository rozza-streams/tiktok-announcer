# 🎙 TikTok Live Announcer

An accessibility-first TikTok Live announcer built for streamers with visual impairments. Every event — gifts, follows, comments, milestones — is read aloud with priority queuing, earcon sounds, and full voice command control.

---

## ✅ Features

- **Full voice announcements** — gifts, follows, comments, questions, shares, milestones
- **Priority queue** — big gifts interrupt small ones, never any overlap chaos
- **Earcon sounds** — distinct audio cue plays before each announcement type
- **Voice commands** — hands-free control with a wake word
- **Games** — polls, first-to-type, giveaways, wheel spin, countdown
- **Loyalty tracking** — Bronze/Silver/Gold/Legend tiers for returning viewers
- **Gift goal tracker** — announced at 25%, 50%, 75%, 100%
- **Simulation mode** — test everything without being live
- **Setup wizard** — fully voice-guided on first launch
- **Panic button** — one keypress mutes everything and plays a calm message
- **Post-stream report** — full audio summary when you end the stream
- **Toxic filter, profanity bleeper, spam filter**
- **Keyboard shortcuts** — M mute, S skip, R repeat, P panic, Q Q&A mode, C calm mode
- **Multi-user** — multiple streamers can use the same deployment simultaneously

---

## 🚀 Deployment (Free — GitHub + Render.com)

### Step 1 — Push to GitHub

1. Go to [github.com](https://github.com) and create a new repository called `tiktok-announcer`
2. Make it **Public**
3. Upload all these files keeping the folder structure:
   ```
   tiktok-announcer/
   ├── package.json
   ├── server.js
   ├── .gitignore
   └── public/
       ├── index.html
       ├── style.css
       └── app.js
   ```
   You can drag and drop the whole folder, or use Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/tiktok-announcer.git
   git push -u origin main
   ```

### Step 2 — Deploy on Render.com

1. Go to [render.com](https://render.com) and sign in
2. Click **New** → **Web Service**
3. Connect your GitHub account and select your `tiktok-announcer` repository
4. Fill in the settings:
   - **Name:** tiktok-announcer (or any name you like)
   - **Region:** Pick closest to you
   - **Branch:** main
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. Click **Create Web Service**
6. Wait ~2 minutes for the first deploy
7. Your app will be live at `https://your-app-name.onrender.com`

### ⚠️ Render Free Tier Note

The free tier spins down after 15 minutes of inactivity. Since you'll be actively streaming when you use this, it will stay awake. The first load after inactivity takes ~30 seconds to wake up — just open the page a minute before going live.

---

## 💻 Running Locally (for testing)

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open your browser
# Go to http://localhost:3000
```

---

## 🎮 Using The App

1. Open the URL in **Chrome or Edge** (required for Web Speech API)
2. The **setup wizard** will run on first launch — it's fully voice-guided
3. Click **Start Simulation** to test all features without going live
4. To connect for real: click **Connect to TikTok**, enter your username
   - ⚠️ Your TikTok stream must already be live before connecting
5. Use **Test buttons** at the bottom to preview every sound and announcement

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| M   | Mute / Unmute |
| S   | Skip current announcement |
| R   | Repeat last announcement |
| P   | Panic button (mute + calm voice) |
| Q   | Toggle Q&A mode |
| C   | Toggle Calm mode |
| -   | Slow down speech |
| +   | Speed up speech |

---

## 🎤 Voice Commands

Say your wake word (default: **"hey stream"**) followed by:

| Command | Action |
|---------|--------|
| hey stream skip | Skip current |
| hey stream repeat | Repeat last |
| hey stream mute / unmute | Toggle mute |
| hey stream how long | Stream duration |
| hey stream stats | Read all stats |
| hey stream goal | Gift goal progress |
| hey stream earnings | Coins tonight |
| hey stream top gifter | Current top gifter |
| hey stream water | Start water break |
| hey stream panic | Trigger panic |
| hey stream slow down / speed up | Adjust rate |
| hey stream qa mode | Toggle Q&A |
| hey stream shoutout [name] | Shout someone out |
| hey stream good night | End stream + summary |

---

## 🔧 Alternative Free Hosting Options

If Render.com doesn't suit you:

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Render.com** | ✅ Yes | Spins down after 15min inactivity |
| **Railway.app** | ✅ $5 credit/mo | No spin-down, very reliable |
| **Fly.io** | ✅ Yes | No spin-down, slightly more setup |
| **Glitch.com** | ✅ Yes | Easiest setup, spins down |

---

## 📝 Notes

- Requires **Chrome or Edge** browser (Web Speech API)
- TikTok must be **actively live** to connect
- If TikTok's API changes, use **Simulation Mode** — it works identically offline
- All settings and nicknames save to your browser's localStorage
- Multiple people can use the same URL simultaneously — each session is independent

---

Built with ❤️ for streamers who deserve to focus on their content, not their screen.
