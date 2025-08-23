// src/utils/parsers/alphaParsers.js
// Utility parsers for alphanumeric products (NOTAM, METAR, TAF, SIGMET, AIRMET, PIREP, Upper Winds)
// Goal: provide a simple, robust "give me the raw text" parser for most alpha products
// and a small helper for Upper Winds formatting.

function stripParens(raw) {
  if (!raw) return '';
  raw = String(raw).trim();
  // Remove leading/trailing parentheses that wrap the entire NOTAM block
  if (raw.startsWith('(') && raw.endsWith(')')) {
    raw = raw.slice(1, -1).trim();
  }
  return raw;
}

/**
 * Return the best human-readable text for an alpha item.
 * Preference order:
 *  - item.english (if present)
 *  - item.raw (strip surrounding parentheses)
 *  - item.text
 *  - item.report / item.metar / item.taf / item.body (common keys)
 *  - if item is a string, return it
 *  - fallback to JSON.stringify(item)
 */
export function parseRawAlpha(item) {
  if (!item && item !== '') return '';

  // If item already a string, return as-is
  if (typeof item === 'string') {
    return item.trim();
  }

  // Prefer an explicit english translation
  if (item.english && typeof item.english === 'string' && item.english.trim()) {
    return stripParens(item.english);
  }

  // Prefer raw field (common for NOTAM)
  if (item.raw && typeof item.raw === 'string' && item.raw.trim()) {
    return stripParens(item.raw);
  }

  // Common fallback fields
  const fallbackFields = ['text', 'report', 'metar', 'taf', 'body', 'remarks', 'message'];
  for (const f of fallbackFields) {
    if (item[f] && typeof item[f] === 'string' && item[f].trim()) {
      return stripParens(item[f]);
    }
  }

  // If item contains both english/french as objects, attempt to join
  if (item.english && typeof item.english === 'object' && item.english.raw) {
    return stripParens(item.english.raw);
  }
  if (item.french && typeof item.french === 'object' && item.french.raw) {
    return stripParens(item.french.raw);
  }

  // If item has a `text` which is JSON (stringified), try parse then return
  if (typeof item.text === 'string') {
    try {
      const parsed = JSON.parse(item.text);
      if (typeof parsed === 'string') return parsed.trim();
      if (parsed && typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
    } catch {
      // not JSON, continue
      return stripParens(item.text);
    }
  }

  // If item has nested data (e.g., { data: {...} }) try to stringify useful parts
  if (item.data && (typeof item.data === 'string' || Array.isArray(item.data))) {
    try {
      if (typeof item.data === 'string') return stripParens(item.data);
      return JSON.stringify(item.data, null, 2);
    } catch {}
  }

  // Last resort: stringify object
  try {
    return JSON.stringify(item, null, 2);
  } catch (err) {
    return String(item);
  }
}

// --- UPPER WINDS parser ---
// Accepts item.text (stringified JSON array) or item (already array)
export function parseUpperWind(item) {
  let arr;
  try {
    arr = typeof item.text === 'string' ? JSON.parse(item.text) : item.text || item;
  } catch {
    return { error: 'Malformed upperwind data', raw: item.text || item };
  }

  if (!Array.isArray(arr)) {
    return { error: 'Upper wind payload is not an array', raw: arr };
  }

  // The expected array structure from examples:
  // [zone, source, issueTime, validStart, validEnd, frameStart, frameEnd, ..., levelsArray]
  const [
    zone,
    source,
    issueTime,
    validStart,
    validEnd,
    frameStart,
    frameEnd,
    unused1,
    unused2,
    unused3,
    unused4,
    levels
  ] = arr;

  // Build readable levels
  const parsedLevels = Array.isArray(levels)
    ? levels.map(lvl => ({
        altitude_ft: lvl[0],
        wind_dir: lvl[1],
        wind_spd: lvl[2],
        temp_c: lvl[3],
        flag: lvl[4]
      }))
    : [];

  // Infer site name if present on the item
  const site = item.site || item.station || item.icao || zone || '';

  // infer usePeriod if frameStart/frameEnd present
  let usePeriod = '';
  try {
    if (frameStart && frameEnd) {
      const s = new Date(frameStart).getUTCHours().toString().padStart(2, '0');
      const e = new Date(frameEnd).getUTCHours().toString().padStart(2, '0');
      usePeriod = `${s}-${e}`;
    }
  } catch {}

  return {
    id: item.pk || item.ID || item.id || '',
    site,
    zone,
    source,
    issueTime,
    validStart,
    validEnd,
    frameStart,
    frameEnd,
    usePeriod,
    levels: parsedLevels
  };
}
