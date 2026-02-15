const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const requestRoutes = require('./routes/requestRoutes');
const { errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/requests', requestRoutes);

app.use(errorHandler);

module.exports = app;
