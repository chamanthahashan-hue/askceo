const http = require('http');
const app = require('./app');
const { port } = require('./config/env');
const { connectDb } = require('./config/db');
const { initSocket } = require('./socket');
const { seedDefaults } = require('./seed/seedDefaults');

async function start() {
  await connectDb();
  await seedDefaults();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${port}`);
  });
}

start();
