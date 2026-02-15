const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const { ceoEmail, ceoPassword, ceoName } = require('../config/env');

async function seedDefaults() {
  const ceo = await User.findOne({ email: ceoEmail.toLowerCase() });
  if (!ceo) {
    const password = await bcrypt.hash(ceoPassword, 10);
    await User.create({
      name: ceoName,
      email: ceoEmail.toLowerCase(),
      password,
      branch: 'Head Office',
      post: 'CEO',
      role: 'admin'
    });
  }

  const defaults = ['Credit requests', 'Funds requests', 'Complaints'];
  await Promise.all(
    defaults.map(async (name) => {
      const exists = await Category.findOne({ name });
      if (!exists) {
        await Category.create({ name });
      }
    })
  );
}

module.exports = { seedDefaults };
