import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const queuePath = path.join(process.cwd(), 'src/data/discovery-queue.json');
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
if (!Array.isArray(queue)) throw new Error('discovery-queue.json का root array होना चाहिए।');

const pending = queue
  .filter((item) => !item?.status || item.status === 'pending')
  .sort((a, b) => Number(b.discoveryScore || 0) - Number(a.discoveryScore || 0));

const clean = (value) => String(value || '')
  .replace(/[\r\n]+/g, ' ')
  .replace(/\]/g, '\\]')
  .trim();

const shown = pending.slice(0, 20);
const lines = [
  '# SHORTSinSHORT Curator Review',
  '',
  `**Pending candidates: ${pending.length}**`,
  '',
  'हर फ़िल्म का YouTube link खोलकर देखिए। मंज़ूरी के लिए इसी Issue पर comment कीजिए:',
  '',
  '`/approve VIDEO_ID`',
  '',
  'हटाने के लिए:',
  '',
  '`/reject VIDEO_ID`',
  '',
  '> Approval केवल repository owner AvinashDas-Art के comment से मानी जाएगी। Approved candidate अभी live catalogue में नहीं जाएगी; वह अगले publishing चरण तक अलग approved list में सुरक्षित रहेगी।',
  '',
  '## Review list',
  ''
];

for (const item of shown) {
  const id = clean(item.youtubeVideoId || item.videoId || item.id);
  const title = clean(item.title || 'Untitled film');
  const url = item.watchUrl || `https://www.youtube.com/watch?v=${id}`;
  const minutes = Number(item.durationMinutes || Math.ceil(Number(item.durationSeconds || 0) / 60));
  const channel = clean(item.channelTitle || 'Unknown channel');
  lines.push(`- [ ] [${title}](${url}) - ${minutes || '?'} min - ${channel} - \`${id}\``);
  lines.push(`  - Approve: \`/approve ${id}\``);
  lines.push(`  - Reject: \`/reject ${id}\``);
}

if (pending.length > shown.length) {
  lines.push('', `इस Issue में पहले ${shown.length} candidates दिख रहे हैं। बाकी अगली update में आएंगी।`);
}

if (!pending.length) lines.push('अभी review के लिए कोई candidate नहीं है।');

const output = process.env.REVIEW_FILE
  || path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'shortsinshort-review.json');
fs.writeFileSync(output, JSON.stringify({ pendingCount: pending.length, body: lines.join('\n') }, null, 2));
console.log(`Review notification prepared: ${pending.length} pending candidate(s).`);
