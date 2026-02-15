function generateRequestCode() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${Date.now()}-${random}`;
}

module.exports = { generateRequestCode };
