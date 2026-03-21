/**
 * Seoul Public Transport Status
 * Aggregates publicly available Seoul transit information
 * Uses free publicly accessible data
 */

// Seoul subway lines info — static reference data + live estimation
const SUBWAY_LINES = [
  { line: '1', name: 'Line 1', color: '#0052A4', stations: 98 },
  { line: '2', name: 'Line 2', color: '#00A84D', stations: 51 },
  { line: '3', name: 'Line 3', color: '#EF7C1C', stations: 44 },
  { line: '4', name: 'Line 4', color: '#00A5DE', stations: 48 },
  { line: '5', name: 'Line 5', color: '#996CAC', stations: 51 },
  { line: '6', name: 'Line 6', color: '#CD7C2F', stations: 38 },
  { line: '7', name: 'Line 7', color: '#747F00', stations: 51 },
  { line: '8', name: 'Line 8', color: '#E6186C', stations: 17 },
  { line: '9', name: 'Line 9', color: '#BDB092', stations: 38 },
  { line: 'Gyeongui-Jungang', name: 'Gyeongui-Jungang Line', color: '#77C4A3', stations: 53 },
  { line: 'Shinbundang', name: 'Shinbundang Line', color: '#D31145', stations: 12 },
];

function getOperatingStatus() {
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const hour = koreaTime.getHours();
  const minutes = koreaTime.getMinutes();
  const dayOfWeek = koreaTime.getDay(); // 0=Sun
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let status, interval_min, note;

  if (hour >= 5 && hour < 6) {
    status = 'starting';
    interval_min = 10;
    note = 'First trains departing. Limited service.';
  } else if (hour >= 6 && hour < 9 && !isWeekend) {
    status = 'rush_hour';
    interval_min = 2;
    note = 'Morning rush hour. Expect crowded trains.';
  } else if (hour >= 9 && hour < 17) {
    status = 'normal';
    interval_min = isWeekend ? 6 : 4;
    note = 'Regular service operating normally.';
  } else if (hour >= 17 && hour < 20 && !isWeekend) {
    status = 'rush_hour';
    interval_min = 2;
    note = 'Evening rush hour. Expect crowded trains.';
  } else if (hour >= 20 && hour < 23) {
    status = 'normal';
    interval_min = 6;
    note = 'Late evening service. Reduced frequency.';
  } else if (hour === 23 && minutes < 30) {
    status = 'ending';
    interval_min = 8;
    note = 'Last trains departing soon.';
  } else {
    status = 'closed';
    interval_min = null;
    note = 'Service closed. First train at ~5:30 AM.';
  }

  return { status, interval_min, note, is_weekend: isWeekend };
}

async function getSeoulTransportStatus() {
  const operating = getOperatingStatus();
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

  return {
    city: 'Seoul',
    timestamp: koreaTime.toISOString(),
    timezone: 'Asia/Seoul',
    subway: {
      operating_status: operating.status,
      interval_minutes: operating.interval_min,
      note: operating.note,
      is_weekend: operating.is_weekend,
      operating_hours: '05:30 - 24:00',
      lines: SUBWAY_LINES.map((l) => ({
        ...l,
        status: operating.status === 'closed' ? 'closed' : 'normal',
      })),
      total_lines: SUBWAY_LINES.length,
      total_stations: SUBWAY_LINES.reduce((sum, l) => sum + l.stations, 0),
    },
    bus: {
      operating_status: operating.status === 'closed' ? 'night_bus_only' : 'normal',
      note:
        operating.status === 'closed'
          ? 'Regular buses stopped. Night owl buses (N-buses) operate on limited routes.'
          : 'Regular bus service operating.',
      types: [
        { type: 'Blue', description: 'Trunk routes (long distance)', color: '#0000FF' },
        { type: 'Green', description: 'Branch routes (local)', color: '#00AA00' },
        { type: 'Red', description: 'Express routes (suburban)', color: '#FF0000' },
        { type: 'Yellow', description: 'Circular routes (downtown)', color: '#FFAA00' },
        { type: 'Night Owl', description: 'Late night routes (N-prefix)', color: '#000066' },
      ],
    },
  };
}

module.exports = { getSeoulTransportStatus };
