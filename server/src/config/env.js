const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/askceo',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  ceoEmail: process.env.CEO_EMAIL || 'ceo@company.com',
  ceoPassword: process.env.CEO_PASSWORD || 'admin123',
  ceoName: process.env.CEO_NAME || 'Company CEO',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};
