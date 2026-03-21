/**
 * Korean City Weather Data
 * Uses wttr.in — free, no auth required
 */

const CITY_MAP = {
  seoul: 'Seoul',
  busan: 'Busan',
  jeju: 'Jeju',
  incheon: 'Incheon',
  daegu: 'Daegu',
  daejeon: 'Daejeon',
  gwangju: 'Gwangju',
  ulsan: 'Ulsan',
  suwon: 'Suwon',
  changwon: 'Changwon',
  jeonju: 'Jeonju',
  chuncheon: 'Chuncheon',
  gangneung: 'Gangneung',
  pohang: 'Pohang',
  yeosu: 'Yeosu',
};

async function getWeather(city) {
  const key = city.toLowerCase();
  const resolved = CITY_MAP[key];
  if (!resolved) {
    const supported = Object.keys(CITY_MAP).join(', ');
    throw new Error(`Unsupported city: "${city}". Supported: ${supported}`);
  }

  const url = `https://wttr.in/${resolved}?format=j1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'korea-public-data-api/1.0' },
  });

  if (!res.ok) {
    throw new Error(`Weather API returned ${res.status}`);
  }

  const data = await res.json();
  const current = data.current_condition?.[0] || {};
  const forecast = (data.weather || []).slice(0, 3);

  return {
    city: resolved,
    current: {
      temp_c: Number(current.temp_C),
      feels_like_c: Number(current.FeelsLikeC),
      humidity: Number(current.humidity),
      wind_speed_kmh: Number(current.windspeedKmph),
      wind_dir: current.winddir16Point,
      description: current.weatherDesc?.[0]?.value || '',
      visibility_km: Number(current.visibility),
      pressure_mb: Number(current.pressure),
      uv_index: Number(current.uvIndex),
      observation_time: current.observation_time,
    },
    forecast: forecast.map((day) => ({
      date: day.date,
      max_temp_c: Number(day.maxtempC),
      min_temp_c: Number(day.mintempC),
      avg_temp_c: Number(day.avgtempC),
      total_snow_cm: Number(day.totalSnow_cm),
      sun_hours: Number(day.sunHour),
      uv_index: Number(day.uvIndex),
      description: day.hourly?.[4]?.weatherDesc?.[0]?.value || '',
    })),
  };
}

function getSupportedCities() {
  return Object.entries(CITY_MAP).map(([key, name]) => ({ key, name }));
}

module.exports = { getWeather, getSupportedCities };
