// utils/parsers/alphaParsers.js

function stripParens(raw) {
  if (!raw) return '';
  raw = raw.trim();
  if (raw.startsWith('(') && raw.endsWith(')')) {
    return raw.slice(1, -1);
  }
  return raw;
}

export function parseNOTAM(item) {
  return stripParens(item.raw || item.text || '');
}
export function parseSIGMET(item) {
  return stripParens(item.raw || item.text || '');
}
export function parseAIRMET(item) {
  return stripParens(item.raw || item.text || '');
}
export function parsePIREP(item) {
  return stripParens(item.raw || item.text || '');
}
export function parseUpperWind(item) {
  // unchanged
  let arr;
  try {
    arr = typeof item.text === 'string' ? JSON.parse(item.text) : item.text;
  } catch {
    return { error: 'Malformed upperwind data', raw: item.text };
  }
  const [
    zone, source, issueTime, validStart, validEnd,
    frameStart, frameEnd,
    unused1, unused2, unused3, unused4,
    levels
  ] = arr;

  let usePeriod = '';
  if (frameStart && frameEnd) {
    const startH = new Date(frameStart).getUTCHours().toString().padStart(2, '0');
    const endH = new Date(frameEnd).getUTCHours().toString().padStart(2, '0');
    usePeriod = `${startH}-${endH}`;
  }
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
