import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import sessionRoutes from './routes/sessionRoutes.js';
import { rateLimit } from './middleware/rateLimit.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '15mb' }));
app.use(rateLimit);
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/sessions', sessionRoutes);

export default app;
