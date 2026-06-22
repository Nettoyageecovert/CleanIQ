require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CleanIQ backend is running',
    frontend: 'http://localhost:5173',
  });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CleanIQ API is running' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(` CleanIQ backend running on http://localhost:${PORT}`);
});