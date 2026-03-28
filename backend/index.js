require('dotenv').config();
const express = require('express');
const cors = require('cors');

const stripeRoutes = require('./routes/stripeRoutes');
const charityRoutes = require('./routes/charityRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const drawRoutes = require('./routes/drawRoutes');
const winnerRoutes = require('./routes/winnerRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
   origin: process.env.FRONTEND_URL || '*',
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization']
}));

// Webhook route needs raw body for Stripe signature validation
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// For all other routes, parse JSON bodies
app.use(express.json());

// Mount the routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.send('Golf Charity Platform API is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
