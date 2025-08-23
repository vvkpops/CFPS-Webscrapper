// utils/parsers/alphaParsers.js

// --- NOTAM --- (modeled after Node backend flatten logic)
export function parseNOTAM(item) {
  // Flattened NOTAM: match backend fields
  return {
    number: item.number || '',
    type: item.type || '',
    classification: item.classification || '',
    icao: item.icao || item.location || '',
    location: item.location || '',
    validFrom: item.validFrom || item.issued || '',
    validTo: item.validTo || '',
    summary: item.summary || '',
    body: item.body || '',
    qLine: item.qLine || ''
  };
}

// --- UPPER WINDS ---
export function parseUpperWind(item) {
  // item.text is the JSON array as string, e.g.
  // '["FBCN35", "KWNO", "...", ... , [[24000,310,62,-25,0],[53000,250,35,-56,0],...]]'
  let arr;
  try {
    arr = typeof item.text === 'string' ? JSON.parse(item.text) : item.text;
  } catch {
    return { error: 'Malformed upperwind data', raw: item.text };
  }
  // Meta fields
  const [
    zone, source, issueTime, validStart, validEnd,
    frameStart, frameEnd,
    unused1, unused2, unused3, unused4,
    levels
  ] = arr;

  return {
    id: item.pk || item.ID || item.id || '',
    time: item.startValidity || item.validity || frameStart || '',
    zone,
    source,
    issueTime,
    validStart,
    validEnd,
    frameStart,
    frameEnd,
    levels: (Array.isArray(levels) ? levels.map(lvl => ({
      altitude_ft: lvl[0],
      wind_dir: lvl[1],
      wind_spd: lvl[2],
      temp_c: lvl[3],
      flag: lvl[4]
    })) : [])
  };
}

// --- SIGMET/AIRMET/PIREP: Placeholder, update with real samples for robust parsing
export function parseSIGMET(item) {
  return { id: item.id || '', region: item.region || '', validity: item.validity || '', phenomenon: item.phenomenon || '', text: item.text || '' };
}
export function parseAIRMET(item) {
  return { id: item.id || '', region: item.region || '', validity: item.validity || '', phenomenon: item.phenomenon || '', text: item.text || '' };
}
export function parsePIREP(item) {
  return { type: item.type || '', location: item.location || '', time: item.time || '', details: item.details || '', text: item.text || '' };
}
