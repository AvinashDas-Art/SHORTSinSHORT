// Auto-discovered YouTube titles/descriptions are often raw upload metadata,
// not editorial copy: a film's real name gets buried under marketing text
// ("FILM NAME - Award-Winning Short Film | Language"), and descriptions
// routinely open with app-download links, "subscribe" asks, and cast/crew
// credit blocks before the actual one-line synopsis. These two helpers turn
// that raw text into what a curated site should actually show: just the
// film's name, and just its synopsis.

const safeText = (value, lang = 'en') => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || Object.values(value)[0] || '';
  return String(value);
};

// Channels routinely tack descriptive/marketing text onto the film's own
// name using a dash or pipe as a separator - e.g. "Aplam Chaplam ( Whatever )
// - Manto's Characters Ignite a Shocking Twist in a Shared Cab Ride - Hindi"
// is really just "Aplam Chaplam ( Whatever )". But plenty of real titles
// are themselves legitimately "Name - Subtitle" (e.g. "Aaro - Someone
// (ആരോ)", "OP - Stop Smelling Ur Socks") - blindly keeping only the first
// segment would mangle those. So instead this only trims segments off the
// END of the title, and only when a segment reads as marketing/metadata
// rather than part of the name: a known junk keyword (award-winning,
// "short film" in several languages, a bare language name, a lone year),
// or simply a long, sentence-like clause (real (sub)titles are almost
// always a handful of words; a 6+ word trailing clause is a tagline, not
// a title). Segments are dropped from the end only while they keep
// matching, so a title is left untouched the moment a trailing segment
// looks like genuine title text.
const JUNK_TAIL_WORDS = 5;
const JUNK_TAIL_PATTERN = /\b(short\s*film|shortfilm|short\s*movie|shortmovie|cortometraje|court[\s-]?m[ée]trage|kurzfilm|award[- ]?winning|award\s*winner(?:s)?|official(?:\s*trailer)?|animat(?:ed|ion)|documentary|festival|subscribe|full\s*movie|new\s*release|must\s*watch|trailer|remaster|starring|featuring|nominated|hindi|english|malayalam|tamil|telugu|bengali|marathi|punjabi|urdu|bhojpuri|maithili|kannada|gujarati|odia|oriya|assamese|nepali|spanish|french|german|iranian|korean|italian)\b/i;
const YEAR_ONLY = /^\(?\d{4}\)?$/;

function isJunkTailSegment(segment) {
  const trimmed = segment.trim();
  if (YEAR_ONLY.test(trimmed)) return true;
  if (JUNK_TAIL_PATTERN.test(trimmed)) return true;
  return trimmed.split(/\s+/).filter(Boolean).length > JUNK_TAIL_WORDS;
}

export function cleanFilmTitle(value, lang = 'en') {
  let title = safeText(value, lang)
    .replace(/(^|\s)#[\p{L}\p{N}_-]+/gu, ' ')
    .replace(/[🎬🏆🐾🔥✨🌟🎥]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const metadataTail = title.match(/\s+(?:(?:award[- ]?winning|festival[- ]?selected|official)\s+)?(?:(?:hindi|english|malayalam|tamil|telugu|bengali|bangla|marathi|punjabi|urdu|bhojpuri|maithili|kannada|gujarati|odia)\s*)?(?:short\s*(?:film|movie)|shortfilm)\b/i);
  if (metadataTail?.index > 1) title = title.slice(0, metadataTail.index).trim();
  title = title
    .replace(/\s+(?:bengali|bangla|malayalam|hindi|tamil|telugu|marathi|kannada)?awardwinning(?:short)?\s*film.*$/i, '')
    .replace(/[\s|:;,.!\-–—]+$/g, '')
    .trim();
  if ((title.match(/\(/g) || []).length > (title.match(/\)/g) || []).length) {
    title = title.slice(0, title.lastIndexOf('(')).replace(/[\s|:;,.!\-–—]+$/g, '').trim();
  }

  const segments = title.split(/\s+[-–—|]\s+/).map((part) => part.trim()).filter(Boolean);
  if (segments.length <= 1) return title;

  // A pipe in YouTube metadata nearly always separates the real title from
  // language, cast, channel or promotional copy. Keep the film name clean.
  if (title.includes('|')) return segments[0] || title;

  if (segments.slice(1).some(isJunkTailSegment)) return segments[0] || title;

  let end = segments.length;
  while (end > 1 && isJunkTailSegment(segments[end - 1])) end -= 1;
  const name = segments.slice(0, end).join(' - ').trim();
  return name || title;
}

// Strip URLs before sentence-splitting - a period inside a URL (e.g.
// "play.google.com") would otherwise be mistaken for a sentence boundary -
// and drop whole lines that are pure promotional boilerplate rather than
// synopsis, so the app-store links and cast/crew block common on channels
// like Pocket Films never surface as the shown "synopsis".
const BOILERPLATE_LINE = /^(download now|subscribe|click here|visit www|ott play|facebook\s*-|instagram\s*-|twitter\s*-|are you a filmmaker|cast\s*&?\s*crew|director\s*:|writer\s*:|producer\s*:|music\s*\/?\s*sound|lyricist|creative producer|assistant director|casting director|editor\s*:|costume designer|mixing engineer|digital intermediate|production manager|cinematographer|actors?\s*:|the story, all names|the use of tobacco)/i;

const LEADING_PUNCTUATION = /^[\s'"“”‘’,:;`.\-]+/;

export function cleanEditorialText(value, lang = 'en') {
  const lines = safeText(value, lang)
    .split('\n')
    .map((line) => line.replace(/https?:\/\/\S+/g, ' ').trim())
    // Drop boilerplate lines outright, plus any line left with nothing but
    // punctuation (a lone "." is common as its own line in these
    // descriptions, and would otherwise become a false sentence boundary).
    .filter((line) => line && !BOILERPLATE_LINE.test(line) && /[\p{L}\p{N}]/u.test(line));

  const raw = lines.join(' ')
    .replace(/(^|\s)#[\p{L}\p{N}_-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .replace(LEADING_PUNCTUATION, '')
    .trim();
  if (!raw) return '';
  const sentences = raw.match(/[^.!?]+[.!?]+/g);
  if (sentences?.length) {
    return sentences.slice(0, 2).join(' ').replace(LEADING_PUNCTUATION, '').trim();
  }
  const clauses = raw.split(',').map((part) => part.trim()).filter(Boolean);
  if (clauses.length > 2) return `${clauses.slice(0, 2).join(', ')}.`;
  if (!/[.!?][”’'"]?$/.test(raw)) return '';
  if (raw.length <= 190) return raw;
  return `${raw.slice(0, 187).replace(/\s+\S*$/, '')}…`;
}
