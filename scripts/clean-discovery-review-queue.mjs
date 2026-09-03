import fs from 'node:fs';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const queuePath = path.join(process.cwd(), 'src/data/discovery-queue.json');
const rejectedPath = path.join(process.cwd(), 'src/data/discovery-rejected.json');

const readArray = (file) => {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(value)) throw new Error(file + ' का root array होना चाहिए।');
  return value;
};

const idOf = (item) => String(item?.youtubeVideoId || item?.videoId || item?.id || '').trim();
const titleOf = (item) => String(item?.title || '').trim();
const editorialNonFilmPatterns = [
  /\bhow\s+(?:to|i|we)\b.{0,100}\b(?:short[\s-]*films?|filmmak(?:er|ing)|screenwrit)/i,
  /\b(?:what|why|when|where)\s+(?:to|should|can|do|is|are)\b.{0,100}\b(?:short[\s-]*films?|filmmak(?:er|ing)|screenwrit)/i,
  /\bavoid\b.{0,100}\b(?:short[\s-]*films?|filmmak(?:er|ing)|screenwrit)/i,
  /\b(?:short[\s-]*films?|filmmak(?:er|ing)|screenwrit)\b.{0,100}\b(?:course|tutorial|tips?|guide|clich[eé]s?|mistakes?|budget|festival\s+circuit|social\s+media|distribution|marketing|promotion|release\s+strategy)/i,
  /\b(?:course|tutorial|tips?|guide|clich[eé]s?|mistakes?|budget|festival\s+circuit|social\s+media|distribution|marketing|promotion|release\s+strategy)\b.{0,100}\b(?:short[\s-]*films?|filmmak(?:er|ing)|screenwrit)/i,
  /\bfilm\s+festivals?\b.{0,80}\b(?:social\s+media|what\s+to\s+do|submission|distribution|marketing|promotion)/i,
  /\b(?:festival|short[\s-]*films?)\b.{0,50}\b(?:promo|promotion|highlights?|recap|coverage|news)/i,
  /\b(?:promo|promotion|highlights?|recap|coverage|news)\b.{0,50}\b(?:festival|short[\s-]*films?)/i,
  /\binside\s+(?:the\s+)?[^|]{0,60}\bfilm\s+festival\b/i,
  /\b(?:wins?|won)\s+at\s+(?:cannes|sundance|berlinale|venice|tribeca)\b/i
];
const isEditorialNonFilmTitle = (title) => editorialNonFilmPatterns.some((pattern) => pattern.test(title));

const queue = readArray(queuePath);
const rejected = readArray(rejectedPath);
const now = new Date().toISOString();
const moved = [];
const kept = [];

for (const item of queue) {
  const pending = !item?.status || item.status === 'pending';
  if (pending && isEditorialNonFilmTitle(titleOf(item))) {
    moved.push({
      ...item,
      status: 'rejected',
      reason: 'editorial_non_film',
      rejectedAt: now,
      rejectionType: 'automatic_quality_v2'
    });
  } else {
    kept.push(item);
  }
}

const merged = [...rejected, ...moved];
const deduped = [];
const seen = new Set();
for (let index = merged.length - 1; index >= 0; index -= 1) {
  const item = merged[index];
  const key = idOf(item) || 'no-id:' + titleOf(item).toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  deduped.push(item);
}
deduped.reverse();

console.log('Review queue total: ' + queue.length);
console.log('Quality V2.1 removals: ' + moved.length);
for (const item of moved) console.log('MOVE ' + (idOf(item) || '?') + ' | ' + titleOf(item));

if (!apply) {
  console.log('DRY RUN: कोई फ़ाइल नहीं बदली। लागू करने के लिए --apply जोड़िए।');
  process.exit(0);
}

const writeAtomic = (file, value) => {
  const temporary = file + '.tmp-' + process.pid;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temporary, file);
};

writeAtomic(queuePath, kept);
writeAtomic(rejectedPath, deduped);
console.log('APPLIED: ग़ैर-फ़िल्म entries review queue से rejected archive में रख दी गईं।');
