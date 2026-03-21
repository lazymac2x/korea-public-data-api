/**
 * KRW Exchange Rates
 * Uses exchangerate-api.com open/free endpoint — no auth required
 */

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'JPY', 'CNY', 'GBP', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD', 'THB', 'TWD', 'VND', 'PHP', 'MYR', 'IDR', 'INR'];

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchRates() {
  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const res = await fetch('https://open.er-api.com/v6/latest/KRW');
  if (!res.ok) {
    throw new Error(`Exchange rate API returned ${res.status}`);
  }

  const json = await res.json();
  if (json.result !== 'success') {
    throw new Error('Exchange rate API error');
  }

  cache = { data: json, timestamp: now };
  return json;
}

async function getExchangeRate(currency) {
  const code = currency.toUpperCase();
  if (!SUPPORTED_CURRENCIES.includes(code)) {
    throw new Error(`Unsupported currency: "${currency}". Supported: ${SUPPORTED_CURRENCIES.join(', ')}`);
  }

  const data = await fetchRates();
  const rate = data.rates?.[code];
  if (rate == null) {
    throw new Error(`Rate not available for ${code}`);
  }

  // rate is KRW -> target, we want "1 target = X KRW"
  const krwPerUnit = 1 / rate;

  return {
    base: 'KRW',
    target: code,
    rate: Number(rate.toFixed(8)),
    krw_per_unit: Number(krwPerUnit.toFixed(2)),
    last_update: data.time_last_update_utc,
    next_update: data.time_next_update_utc,
  };
}

async function getAllRates() {
  const data = await fetchRates();
  const rates = {};
  for (const code of SUPPORTED_CURRENCIES) {
    const rate = data.rates?.[code];
    if (rate != null) {
      rates[code] = {
        rate: Number(rate.toFixed(8)),
        krw_per_unit: Number((1 / rate).toFixed(2)),
      };
    }
  }
  return {
    base: 'KRW',
    last_update: data.time_last_update_utc,
    rates,
  };
}

module.exports = { getExchangeRate, getAllRates, SUPPORTED_CURRENCIES };
