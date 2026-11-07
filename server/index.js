import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LeetCode Streak Saver Server running on http://localhost:${PORT}`);
});
