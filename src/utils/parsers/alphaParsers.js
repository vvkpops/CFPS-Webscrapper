// utils/parsers/alphaParsers.js

// NOTAM parser: extracts fields from raw NOTAM JSON as provided by the API
export function parseNOTAM(item) {
  const raw = item.raw || '';
  const english = item.english || null;
  const french = item.french || null;

  // Split lines for easier parsing
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  // Header: usually first line (e.g., H4387/25 NOTAMR H4359/25)
  const headerLine = lines[0] || '';
  // Q) line
  const qLine = lines.find(l => l.startsWith('Q)')) || '';
  // A) line (locations)
  const aLine = lines.find(l => l.startsWith('A)')) || '';
  // B) and C) lines (validity)
  const bLine = lines.find(l => l.startsWith('B)')) || '';
  const cLine = lines.find(l => l.startsWith('C)')) || '';
  // E) line (main text, possibly multiline)
  let eIndex = lines.findIndex(l => l.startsWith('E)'));
  let eLines = [];
  if (eIndex >= 0) {
    eLines = lines.slice(eIndex);
    // Remove any field tags from E) content
    let textLines = [];
    for (let line of eLines) {
      if (/^[A-Z]\)/.test(line) && !line.startsWith('E)')) break; // next field
      textLines.push(line.replace(/^E\)\s*/, ''));
    }
    eLines = textLines;
  }
  const eText = eLines.join('\n').trim();

  // Try to extract French/English text if provided or present in the E) block
  let mainText = english || eText;
  let frText = french || null;
  if (eText.includes('FR:')) {
    const [en, fr] = eText.split('FR:');
    mainText = en.trim();
    frText = fr.trim();
  }

  // Parse Q) line for details
  let qFields = {};
  if (qLine) {
    // Example: Q) CZQX/QAACH/IV/BO/E/000/999/4848N05604W205
    // FIR/subject/traffic/purpose/scope/lower/upper/coords
    const qMatch = qLine.match(
      /^Q\)\s*([A-Z]{4})\/([A-Z0-9]{5})\/([A-Z]+)\/([A-Z]+)\/([A-Z]+)\/(\d{3})\/(\d{3})\/([0-9N]+[EW]+[0-9]*)/
    );
    if (qMatch) {
      qFields = {
        FIR: qMatch[1],
        Subject: qMatch[2],
        Traffic: qMatch[3],
        Purpose: qMatch[4],
        Scope: qMatch[5],
        Lower: qMatch[6],
        Upper: qMatch[7],
        Coordinates: qMatch[8]
      };
    }
  }

  // Compose validity field for table
  const validity =
    (bLine ? `Start: ${bLine.replace(/^B\)\s*/, '')}` : '') +
    (cLine ? `\nEnd: ${cLine.replace(/^C\)\s*/, '')}` : '');

  return {
    header: headerLine,
    ...qFields,
    location: aLine ? aLine.replace(/^A\)\s*/, '') : '',
    validity,
    text: mainText,
    text_fr: frText
  };
}

// Placeholder SIGMET parser
export function parseSIGMET(item) {
  return { id: '', region: '', validity: '', phenomenon: '', text: item.raw || item.text || '' };
}

// Placeholder AIRMET parser
export function parseAIRMET(item) {
  return { id: '', region: '', validity: '', phenomenon: '', text: item.raw || item.text || '' };
}

// Placeholder PIREP parser
export function parsePIREP(item) {
  return { type: '', location: '', time: '', details: '', text: item.raw || item.text || '' };
}

// Upper Wind parser (simple table splitter)
export function parseUpperWind(item) {
  const lines = (item.raw || item.text || '').split('\n').filter(line => line.trim());
  // Example: FL Level, Wind Dir, Wind Spd, Temp
  return lines.map(line => {
    const parts = line.split(/\s+/);
    return {
      level: parts[0] || '',
      windDir: parts[1] || '',
      windSpd: parts[2] || '',
      temp: parts[3] || '',
    };
  });
}
