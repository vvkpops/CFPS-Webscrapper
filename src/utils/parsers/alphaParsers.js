// utils/parsers/alphaParsers.js

export function parseUpperWind(item) {
  // item.text is the JSON array as string or array
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

  // Try to infer use period from frameStart/frameEnd
  let usePeriod = '';
  if (frameStart && frameEnd) {
    const startH = new Date(frameStart).getUTCHours().toString().padStart(2, '0');
    const endH = new Date(frameEnd).getUTCHours().toString().padStart(2, '0');
    usePeriod = `${startH}-${endH}`;
  }

  // Try to get site from item.site or zone
  const site = item.site || zone || '';

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
    usePeriod,
    site,
    levels: Array.isArray(levels) ? levels.map(lvl => ({
      altitude_ft: lvl[0],
      wind_dir: lvl[1],
      wind_spd: lvl[2],
      temp_c: lvl[3],
      flag: lvl[4]
    })) : []
  };
}

export function parseNOTAM(item) {
  // Just return the raw info
  return item;
}

// (SIGMET/AIRMET/PIREP unchanged)
export function parseSIGMET(item) { return item; }
export function parseAIRMET(item) { return item; }
export function parsePIREP(item) { return item; }
