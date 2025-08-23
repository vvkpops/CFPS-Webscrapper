// utils/parsers/alphaParsers.js

// Helper for extracting value by regex
const extract = (text, regex) => {
  const match = text.match(regex);
  return match ? match[1]?.trim() : '';
};

export function parseNOTAM(item) {
  // Try to extract common NOTAM fields from text
  return {
    number: extract(item.text, /NOTAM\s*(\d+)/i),
    location: extract(item.text, /Location:\s*(\w+)/i),
    validity: extract(item.text, /Validity:\s*([^\n]+)/i),
    subject: extract(item.text, /Subject:\s*([^\n]+)/i),
    text: item.text,
  };
}

export function parseSIGMET(item) {
  return {
    id: extract(item.text, /SIGMET\s*(\w+)/i),
    region: extract(item.text, /Region:\s*([^\n]+)/i),
    validity: extract(item.text, /Validity:\s*([^\n]+)/i),
    phenomenon: extract(item.text, /Phenomenon:\s*([^\n]+)/i),
    text: item.text,
  };
}

export function parseAIRMET(item) {
  return {
    id: extract(item.text, /AIRMET\s*(\w+)/i),
    region: extract(item.text, /Region:\s*([^\n]+)/i),
    validity: extract(item.text, /Validity:\s*([^\n]+)/i),
    phenomenon: extract(item.text, /Phenomenon:\s*([^\n]+)/i),
    text: item.text,
  };
}

export function parsePIREP(item) {
  return {
    type: extract(item.text, /PIREP\s*(\w+)/i),
    location: extract(item.text, /Location:\s*([^\n]+)/i),
    time: extract(item.text, /Time:\s*([^\n]+)/i),
    details: extract(item.text, /Details:\s*([^\n]+)/i),
    text: item.text,
  };
}

export function parseUpperWind(item) {
  // If text is a table, try to split by lines and columns
  const lines = item.text.split('\n').filter(line => line.trim());
  // Example: FL Level, Wind Dir, Wind Spd, Temp
  const rows = lines.map(line => {
    const parts = line.split(/\s+/);
    return {
      level: parts[0] || '',
      windDir: parts[1] || '',
      windSpd: parts[2] || '',
      temp: parts[3] || '',
    };
  });
  return rows;
}
