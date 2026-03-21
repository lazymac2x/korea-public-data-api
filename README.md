# Korea Public Data API

Unified REST API + MCP server for Korean public data. No API keys required.

## Data Sources

| Endpoint | Source | Auth |
|----------|--------|------|
| Weather | wttr.in | None |
| Exchange Rates | open.er-api.com | None |
| Holidays | date.nager.at | None |
| Transport | Static + real-time logic | None |
| Stocks | Yahoo Finance | None |

## Quick Start

```bash
npm install
npm start
# Server runs on http://localhost:3200
```

## API Endpoints

### Weather

```
GET /api/v1/weather              # List supported cities
GET /api/v1/weather/:city        # Get weather for a city
```

Supported cities: Seoul, Busan, Jeju, Incheon, Daegu, Daejeon, Gwangju, Ulsan, Suwon, Changwon, Jeonju, Chuncheon, Gangneung, Pohang, Yeosu

### Exchange Rates

```
GET /api/v1/exchange             # All KRW rates
GET /api/v1/exchange/:currency   # Specific rate (USD, EUR, JPY, CNY, etc.)
```

### Holidays

```
GET /api/v1/holidays/:year       # Korean public holidays for a year
```

### Transport

```
GET /api/v1/transport/seoul/status   # Seoul subway & bus status
```

### Stocks

```
GET /api/v1/stocks/summary       # KOSPI & KOSDAQ index data
```

## MCP Server

Use as a Model Context Protocol server for AI assistants:

```json
{
  "mcpServers": {
    "korea-public-data": {
      "command": "node",
      "args": ["src/mcp-server.js"]
    }
  }
}
```

### Available Tools

- `get_korea_weather` — Weather for Korean cities
- `get_exchange_rate` — KRW exchange rate for a currency
- `get_all_exchange_rates` — All KRW exchange rates
- `get_korean_holidays` — Korean public holidays by year
- `get_seoul_transport_status` — Seoul subway/bus status
- `get_korean_stock_market` — KOSPI/KOSDAQ summary

## Docker

```bash
docker build -t korea-public-data-api .
docker run -p 3200:3200 korea-public-data-api
```

## License

MIT
