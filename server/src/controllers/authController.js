const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function makeToken(id, role) {
  return jwt.sign({ id, role }, jwtSecret, { expiresIn: jwtExpiresIn });
}

async function register(req, res) {
  const { name, email, password, branch, post } = req.body;
  if (!name || !email || !password || !branch || !post) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    branch,
    post,
    role: 'employee'
  });

  const token = makeToken(user._id, user.role);
  return res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      post: user.post,
      role: user.role
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = makeToken(user._id, user.role);
  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      post: user.post,
      role: user.role
    }
  });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, me };
