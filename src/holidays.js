/**
 * Korean Public Holidays
 * Uses date.nager.at — free, no auth required
 */

let cache = {};

async function getHolidays(year) {
  const y = parseInt(year, 10);
  if (isNaN(y) || y < 2000 || y > 2100) {
    throw new Error(`Invalid year: "${year}". Must be between 2000 and 2100.`);
  }

  if (cache[y]) return cache[y];

  const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${y}/KR`);
  if (!res.ok) {
    throw new Error(`Holidays API returned ${res.status}`);
  }

  const data = await res.json();
  const holidays = data.map((h) => ({
    date: h.date,
    name: h.localName,
    name_en: h.name,
    fixed: h.fixed,
    types: h.types,
  }));

  const result = {
    country: 'KR',
    year: y,
    count: holidays.length,
    holidays,
  };

  cache[y] = result;
  return result;
}

module.exports = { getHolidays };
