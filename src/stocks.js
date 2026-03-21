/**
 * Korean Stock Market Summary
 * Uses free Yahoo Finance-compatible endpoints for KOSPI/KOSDAQ index data
 */

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const INDICES = [
  { symbol: '^KS11', name: 'KOSPI', description: 'Korea Composite Stock Price Index' },
  { symbol: '^KQ11', name: 'KOSDAQ', description: 'Korea Securities Dealers Automated Quotations' },
];

async function fetchIndexData(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'korea-public-data-api/1.0' },
  });

  if (!res.ok) return null;

  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta || {};
  const quote = result.indicators?.quote?.[0] || {};
  const prevClose = meta.chartPreviousClose || meta.previousClose;
  const price = meta.regularMarketPrice;
  const change = price && prevClose ? price - prevClose : null;
  const changePercent = change && prevClose ? (change / prevClose) * 100 : null;

  return {
    price: price ? Number(price.toFixed(2)) : null,
    previous_close: prevClose ? Number(prevClose.toFixed(2)) : null,
    change: change ? Number(change.toFixed(2)) : null,
    change_percent: changePercent ? Number(changePercent.toFixed(2)) : null,
    day_high: quote.high?.[0] ? Number(quote.high[0].toFixed(2)) : null,
    day_low: quote.low?.[0] ? Number(quote.low[0].toFixed(2)) : null,
    volume: quote.volume?.[0] || null,
    market_state: meta.marketState || 'UNKNOWN',
    exchange_timezone: meta.exchangeTimezoneName || 'Asia/Seoul',
  };
}

async function getMarketSummary() {
  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const results = await Promise.allSettled(
    INDICES.map(async (idx) => {
      const data = await fetchIndexData(idx.symbol);
      return { ...idx, ...data };
    })
  );

  const indices = results.map((r, i) => {
    if (r.status === 'fulfilled' && r.value.price != null) {
      return r.value;
    }
    return {
      ...INDICES[i],
      price: null,
      error: 'Data temporarily unavailable',
    };
  });

  const koreaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
  const result = {
    market: 'KRX (Korea Exchange)',
    timestamp: new Date(koreaTime).toISOString(),
    timezone: 'Asia/Seoul',
    trading_hours: '09:00 - 15:30 KST (Mon-Fri)',
    indices,
  };

  cache = { data: result, timestamp: now };
  return result;
}

module.exports = { getMarketSummary };
