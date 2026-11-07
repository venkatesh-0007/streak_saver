# ⚡ LeetStreak — LeetCode Streak Saver & Dashboard

A mobile-friendly web dashboard designed for developers who want to maintain their LeetCode streak daily even when busy, traveling, or away from their laptop.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvenkatesh-0007%2Fstreak_saver)

---

## ✨ Features

- **🔥 1-Tap Streak Saver**: Prominent action button that automatically submits a verified 100% Accepted solution to LeetCode with real-time evaluation.
- **⏱️ UTC Midnight Reset Countdown**: Live countdown timer showing hours, minutes, and seconds remaining before LeetCode resets the daily streak.
- **🛡️ Streak Safety Status**: Clear badge indicating whether your streak has already been recorded for today or is currently at risk.
- **📊 Solved Questions Breakdown**:
  - Total solved count & acceptance rate percentage with circular progress gauge.
  - Interactive Easy, Medium, and Hard progress bars with live solved vs total counts.
  - Global LeetCode rank & reputation score.
- **🟩 365-Day Activity Heatmap**: Interactive submission calendar matching LeetCode's exact layout, with hover tooltips and gold marker highlighting today.
- **📜 Recent AC Solutions & Audit History**: View both your live LeetCode submissions and a history log of all automated streak saves.
- **📱 Mobile-First Responsive UI**: Styled with Tailwind CSS in dark mode, perfectly formatted for smartphones so you can tap to save your streak from your phone in seconds.
- **☁️ Vercel Ready**: Full serverless deployment support on Vercel with zero extra backend infrastructure needed.

---

## ☁️ Deploy to Vercel (1-Click)

1. Push this repository to GitHub: `https://github.com/venkatesh-0007/streak_saver`
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"** > **Import Git Repository**.
3. Vercel automatically detects the configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. *(Optional)* Add Environment Variables in Vercel:
   - `LEETCODE_USERNAME`: Your LeetCode username
   - `LEETCODE_SESSION`: Your `LEETCODE_SESSION` cookie
   - `LEETCODE_CSRFTOKEN`: Your `csrftoken` cookie
   *(Note: You can also enter and save these directly inside the app's Settings dialog on your phone/browser!)*
5. Click **Deploy**!

---

## 💻 Local Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Run both backend and frontend concurrently:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Production Node Server
```bash
npm run build
npm start
```
The server will run on **[http://localhost:3001](http://localhost:3001)**.

---

## 📱 How to Access from Your Phone (Local Network)

1. Connect your phone to the same Wi-Fi network as your laptop.
2. Find your laptop's local IP address (e.g. `ipconfig getifaddr en0` on macOS).
3. Open your mobile browser and navigate to:
   ```
   http://<YOUR_LAPTOP_IP>:3001
   ```
4. Tap **"Add to Home Screen"** to have an app icon on your phone!

---

## 🔑 How to Get Your LeetCode Cookies

LeetCode requires authenticated session cookies to submit solutions on your account:

1. Open [leetcode.com](https://leetcode.com) and sign in.
2. Press `F12` (or Right Click anywhere > **Inspect**).
3. Switch to the **Application** tab (Chrome/Edge/Brave) or **Storage** tab (Firefox).
4. Expand **Storage > Cookies** and click on `https://leetcode.com`.
5. Locate and copy the values for:
   - `LEETCODE_SESSION`
   - `csrftoken`
6. Click the **Key icon (Settings)** in the LeetStreak navbar, paste the cookies, click **Verify Session**, and then **Save Credentials**.
