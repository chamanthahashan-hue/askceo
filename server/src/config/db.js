const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDb(uri = mongoUri) {
  await mongoose.connect(uri);
}

module.exports = { connectDb };
