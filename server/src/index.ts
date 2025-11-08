import http from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { runMigrations } from './db/migrator.js';
import { attachVoiceGateway } from './ws/voiceGateway.js';

const bootstrap = async () => {
  runMigrations();

  const server = http.createServer(app);
  attachVoiceGateway(server);

  server.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
