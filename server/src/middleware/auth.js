const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../config/env');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}

module.exports = { auth, adminOnly };
