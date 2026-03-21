const express = require('express');
const cors = require('cors');
const { getWeather, getSupportedCities } = require('./weather');
const { getExchangeRate, getAllRates, SUPPORTED_CURRENCIES } = require('./exchange');
const { getHolidays } = require('./holidays');
const { getSeoulTransportStatus } = require('./transport');
const { getMarketSummary } = require('./stocks');

const app = express();
const PORT = process.env.PORT || 3200;

app.use(cors());
app.use(express.json());

// --- Health / Root ---
app.get('/', (_req, res) => {
  res.json({
    name: 'korea-public-data-api',
    version: '1.0.0',
    description: 'Unified REST API for Korean public data',
    endpoints: [
      'GET /api/v1/weather/:city',
      'GET /api/v1/weather',
      'GET /api/v1/exchange/:currency',
      'GET /api/v1/exchange',
      'GET /api/v1/holidays/:year',
      'GET /api/v1/transport/seoul/status',
      'GET /api/v1/stocks/summary',
    ],
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// --- Weather ---
app.get('/api/v1/weather', (_req, res) => {
  res.json({ supported_cities: getSupportedCities() });
});

app.get('/api/v1/weather/:city', async (req, res) => {
  try {
    const data = await getWeather(req.params.city);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// --- Exchange Rates ---
app.get('/api/v1/exchange', async (_req, res) => {
  try {
    const data = await getAllRates();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/v1/exchange/:currency', async (req, res) => {
  try {
    const data = await getExchangeRate(req.params.currency);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// --- Holidays ---
app.get('/api/v1/holidays/:year', async (req, res) => {
  try {
    const data = await getHolidays(req.params.year);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// --- Transport ---
app.get('/api/v1/transport/seoul/status', async (_req, res) => {
  try {
    const data = await getSeoulTransportStatus();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Stocks ---
app.get('/api/v1/stocks/summary', async (_req, res) => {
  try {
    const data = await getMarketSummary();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- 404 ---
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`korea-public-data-api running on http://localhost:${PORT}`);
});

module.exports = app;
