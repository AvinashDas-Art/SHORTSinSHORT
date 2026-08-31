import fs from 'fs';
import path from 'path';
import https from 'https';

const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyByBdyDejCmzQCUH6E8SKB9KGc6yiXKHGc";

const searchQueries = [
  "Large Short Films",
  "Royal Stag Barrel Select Shorts",
  "HumaraMovie short film",
  "Terribly Tiny Tales short film",
  "Award winning Hindi short film",
  "Oscar winning short film animated",
  "Pocket Films award winning short film",
  "Acclaimed short film"
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

function parseDuration(pt) {
  if (!pt) return "15 min";
  const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "15 min";
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const totalMin = hours * 60 + minutes;
  return totalMin > 0 ? `${totalMin} min` : "8 min";
}

async function run() {
  console.log("🚀 YouTube Data API से शॉर्ट फ़िल्में फ़ेच की जा रही हैं (10,000+ Views)...");
  const filmsMap = new Map();

  for (const q of searchQueries) {
    console.log(`🔎 सर्च हो रहा है: "${q}"...`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=medium&maxResults=25&q=${encodeURIComponent(q)}&key=${API_KEY}`;
    
    const searchRes = await fetchJSON(searchUrl);
    if (!searchRes || !searchRes.items) continue;

    const videoIds = searchRes.items.map(item => item.id?.videoId).filter(Boolean);
    if (videoIds.length === 0) continue;

    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,status&id=${videoIds.join(',')}&key=${API_KEY}`;
    const detailsRes = await fetchJSON(detailsUrl);
    if (!detailsRes || !detailsRes.items) continue;

    for (const v of detailsRes.items) {
      const stats = v.statistics || {};
      const status = v.status || {};
      const views = parseInt(stats.viewCount || 0);

      // 10,000+ views और एम्बेडेबल वीडियो की जाँच
      if (views >= 10000 && status.embeddable !== false) {
        if (!filmsMap.has(v.id)) {
          let title = v.snippet.title.replace(/\|.*$/g, '').replace(/ - Short Film.*$/gi, '').trim();
          let desc = v.snippet.description.slice(0, 160).replace(/\n/g, ' ') || "Acclaimed short film streaming on YouTube.";
          let dur = parseDuration(v.contentDetails?.duration);
          
          let lang = "Hindi";
          let country = "India";
          if (q.includes("Oscar") || q.includes("animated") || q.includes("English")) {
            lang = "English";
            country = "USA";
          }

          let genre = ["Drama", "Award Winning"];
          if (q.includes("animated")) genre = ["Animation", "Family"];
          if (title.toLowerCase().includes("thriller") || desc.toLowerCase().includes("thriller")) genre = ["Thriller", "Mystery"];

          filmsMap.set(v.id, {
            id: `yt_${v.id}`,
            title: { en: title, hi: title },
            description: { en: desc, hi: desc },
            youtubeVideoId: v.id,
            thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
            genre: genre,
            language: lang,
            country: country,
            popularityScore: Math.min(99, Math.floor(views / 50000) + 85),
            duration: dur,
            isFeatured: views > 500000
          });
        }
      }
    }
  }

  const filmsList = Array.from(filmsMap.values());
  console.log(`\n🎉 कुल ${filmsList.length} 100% वेरिफ़ाइड और 10,000+ व्यूज़ वाली फ़िल्में प्राप्त हुईं!`);

  const filmsPath = path.resolve('src/data/films.json');
  fs.writeFileSync(filmsPath, JSON.stringify(filmsList, null, 2), 'utf8');
  console.log("✅ src/data/films.json सफलतापूर्वक अपडेट हो गया!");
}

run();
