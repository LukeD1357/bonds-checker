import serverless from 'serverless-http';
import express from 'express';
import 'express-async-errors';
import { getBondsFromPdf } from './lib/pdf.js';
import { getCurrentWinners } from './lib/nsandi.js';
import { StatusError } from './lib/http.js';
const app = express();
app.use(express.json());
app.get('/api/status', (req, res) => {
  res.json({
    message: 'OK',
  });
});

app.post('/check', async (req, res) => {
  const { bondRecord } = req.body;
  if (!bondRecord) {
    res.status(400).json({
      message: 'bondRecord is required',
    });
  }
  const bonds = await getBondsFromPdf(bondRecord);
  const currentWinners = await getCurrentWinners();
  const winningBonds = bonds.map((bond) => currentWinners[bond]).filter(Boolean);
  res.json(winningBonds).end();
});

app.use(async (err, _req, res, next) => {
  console.error('Error handler start ', err);
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }

  const isStatusError = err instanceof StatusError;
  const status = typeof err.status === 'number' ? err.status : 500;
  const message = isStatusError ? err.message : 'Server error. Please retry.';

  res.status(status).json({
    ...(isStatusError ? err : {}),
    message: message,
  });
  console.error('Error handler end');
  return res.end();
});

const server = serverless(app);
export const handler = async (event, context) => {
  const response = await server(event, context);
  console.log(`${response.statusCode} ${event.httpMethod} ${event.path}`);
  return response;
};
