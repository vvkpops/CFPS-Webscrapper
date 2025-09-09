// utils/parsers/alphaParsers.js - Simplified Version

/**
 * Simple parser to extract raw text from various API response formats
 * Handles the most common structures returned by the Nav Canada API
 */
export function parseRawAlpha(item) {
  if (!item) return '';
  
  // If item is already a string, return it
  if (typeof item === 'string') {
    return item.trim();
  }
  
  // If item is an object, try common field names
  if (typeof item === 'object') {
    // Try direct raw fields first
    if (item.raw && typeof item.raw === 'string') {
      return item.raw.trim();
    }
    
    // Try text fields
    if (item.text && typeof item.text === 'string') {
      return item.text.trim();
    }
    
    // Try english field (common in bilingual responses)
    if (item.english && typeof item.english === 'string') {
      return item.english.trim();
    }
    
    // Try other common field names
    const commonFields = ['body', 'content', 'message', 'data', 'report'];
    for (const field of commonFields) {
      if (item[field] && typeof item[field] === 'string') {
        return item[field].trim();
      }
    }
    
    // If item has data array, try to parse first element
    if (item.data && Array.isArray(item.data) && item.data.length > 0) {
      return parseRawAlpha(item.data[0]);
    }
    
    // Last resort: stringify the object
    try {
      return JSON.stringify(item, null, 2);
    } catch (e) {
      return String(item);
    }
  }
  
  // Fallback
  return String(item);
}

/**
 * Simple upper wind parser - extracts basic information
 */
export function parseUpperWind(item) {
  // This is a placeholder for upper wind parsing
  // The actual implementation would depend on the specific format
  // returned by the Nav Canada API
  
  try {
    if (item && item.text) {
      // Try to parse JSON if it's a string
      const data = typeof item.text === 'string' ? JSON.parse(item.text) : item.text;
      
      if (Array.isArray(data) && data.length > 11) {
        // Basic upper wind format parsing
        const [
          zone,
          source,
          issueTime,
          validStart,
          validEnd,
          frameStart,
          frameEnd,
          ,,,, // unused fields
          levels
        ] = data;
        
        const parsedLevels = Array.isArray(levels) ? levels.map(level => ({
          altitude_ft: level[0],
          wind_dir: level[1],
          wind_spd: level[2],
          temp_c: level[3]
        })) : [];
        
        return {
          site: item.site || zone || '',
          zone,
          source,
          issueTime,
          validStart,
          validEnd,
          frameStart,
          frameEnd,
          levels: parsedLevels
        };
      }
    }
    
    // Fallback: return raw data
    return {
      error: 'Could not parse upper wind data',
      raw: parseRawAlpha(item)
    };
  } catch (e) {
    return {
      error: 'Upper wind parsing failed',
      raw: parseRawAlpha(item)
    };
  }
}
