#!/usr/bin/env node
/**
 * MCP Server for Korea Public Data API
 * Exposes tools via Model Context Protocol (stdio transport)
 */

const { getWeather, getSupportedCities } = require('./weather');
const { getExchangeRate, getAllRates } = require('./exchange');
const { getHolidays } = require('./holidays');
const { getSeoulTransportStatus } = require('./transport');
const { getMarketSummary } = require('./stocks');

const readline = require('readline');

const TOOLS = [
  {
    name: 'get_korea_weather',
    description: 'Get current weather and 3-day forecast for a Korean city. Supported cities: Seoul, Busan, Jeju, Incheon, Daegu, Daejeon, Gwangju, Ulsan, Suwon, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'Korean city name (e.g., Seoul, Busan, Jeju)' },
      },
      required: ['city'],
    },
  },
  {
    name: 'get_exchange_rate',
    description: 'Get KRW exchange rate for a specific currency. Returns how much 1 unit of the target currency costs in KRW.',
    inputSchema: {
      type: 'object',
      properties: {
        currency: { type: 'string', description: 'Currency code (e.g., USD, EUR, JPY, CNY)' },
      },
      required: ['currency'],
    },
  },
  {
    name: 'get_all_exchange_rates',
    description: 'Get all KRW exchange rates for major currencies.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_korean_holidays',
    description: 'Get Korean public holidays for a given year.',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', description: 'Year (2000-2100)' },
      },
      required: ['year'],
    },
  },
  {
    name: 'get_seoul_transport_status',
    description: 'Get current Seoul public transport status including subway and bus operating status, line info, and service intervals.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_korean_stock_market',
    description: 'Get Korean stock market summary with KOSPI and KOSDAQ index data.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function handleToolCall(name, args) {
  switch (name) {
    case 'get_korea_weather':
      return await getWeather(args.city);
    case 'get_exchange_rate':
      return await getExchangeRate(args.currency);
    case 'get_all_exchange_rates':
      return await getAllRates();
    case 'get_korean_holidays':
      return await getHolidays(args.year);
    case 'get_seoul_transport_status':
      return await getSeoulTransportStatus();
    case 'get_korean_stock_market':
      return await getMarketSummary();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function sendResponse(id, result) {
  const response = { jsonrpc: '2.0', id, result };
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message) {
  const response = { jsonrpc: '2.0', id, error: { code, message } };
  process.stdout.write(JSON.stringify(response) + '\n');
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', async (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = msg;

  try {
    switch (method) {
      case 'initialize':
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'korea-public-data-api',
            version: '1.0.0',
          },
        });
        break;

      case 'notifications/initialized':
        // no response needed
        break;

      case 'tools/list':
        sendResponse(id, { tools: TOOLS });
        break;

      case 'tools/call': {
        const { name, arguments: args } = params;
        try {
          const result = await handleToolCall(name, args || {});
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          });
        } catch (err) {
          sendResponse(id, {
            content: [{ type: 'text', text: `Error: ${err.message}` }],
            isError: true,
          });
        }
        break;
      }

      default:
        sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    sendError(id, -32603, err.message);
  }
});

process.stderr.write('korea-public-data-api MCP server started (stdio)\n');
