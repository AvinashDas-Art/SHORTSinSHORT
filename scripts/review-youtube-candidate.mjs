import fs from 'node:fs';
import path from 'node:path';

const action = String(process.argv[2] || '').toLowerCase();
const videoId = String(process.argv[3] || '').trim();
if (!['approve', 'reject'].includes(action)) {
  console.error('ERROR: action approve या reject होनी चाहिए।');
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
  console.error('ERROR: सही 11-character YouTube VIDEO_ID दीजिए।');
  process.exit(1);
}

const root = process.cwd();
const files = {
  queue: path.join(root, 'src/data/discovery-queue.json'),
  approved: path.join(root, 'src/data/discovery-approved.json'),
  rejected: path.join(root, 'src/data/discovery-rejected.json')
};
const read = (file) => {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(value)) throw new Error(`${file} का root array होना चाहिए।`);
  return value;
};
const idFrom = (item) => String(item?.youtubeVideoId || item?.videoId || '').trim();
const queue = read(files.queue);
const approved = read(files.approved);
const rejected = read(files.rejected);
const index = queue.findIndex((item) => idFrom(item) === videoId && (!item.status || item.status === 'pending'));
if (index < 0) {
  console.error(`ERROR: Pending review queue में ${videoId} नहीं मिला।`);
  process.exit(1);
}

const candidate = queue[index];
const remaining = queue.filter((_, itemIndex) => itemIndex !== index);
const reviewedAt = new Date().toISOString();
const reviewedBy = process.env.GITHUB_ACTOR || 'AvinashDas-Art';

if (action === 'approve') {
  if (!approved.some((item) => idFrom(item) === videoId)) {
    approved.push({ ...candidate, status: 'approved', approvedAt: reviewedAt, approvedBy: reviewedBy });
  }
} else if (!rejected.some((item) => idFrom(item) === videoId)) {
  rejected.push({
    ...candidate,
    status: 'rejected',
    reason: 'curator_rejected',
    rejectedAt: reviewedAt,
    rejectedBy: reviewedBy,
    rejectionType: 'curator'
  });
}

const write = (file, value) => {
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temporary, file);
};
write(files.queue, remaining);
write(files.approved, approved.slice(-5000));
write(files.rejected, rejected.slice(-5000));
console.log(`${action.toUpperCase()}: ${videoId} | ${candidate.title || 'Untitled film'}`);
console.log('Live catalogue नहीं बदला।');
