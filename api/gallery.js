// Vercel serverless function: lists the photos / videos in the shop's public Google Drive folders.
// GET /api/gallery?type=photos | videos  ->  { items: [{ id, name, mime, created }] }
//
// Works with zero setup by reading Google's public folder view.
// Optional (more reliable, newest-first ordering): set a GOOGLE_API_KEY environment variable in Vercel
// (Google Cloud > APIs & Services > enable "Google Drive API" > Credentials > API key).

const FOLDERS = {
  photos: process.env.PHOTOS_FOLDER_ID || '102APOgyjvXjVheAKbh5hKoPJQ38trA97',
  videos: process.env.VIDEOS_FOLDER_ID || '1u8xeYLw0fCrC7PJFsbxAKPEO7_P_oV_q',
};
const IMG = /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i;
const VID = /\.(mp4|mov|m4v|webm|mkv|avi|3gp)$/i;

async function viaApi(folderId, key, depth = 0) {
  const out = [];
  let pageToken = '';
  do {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime desc&pageSize=1000` +
      `&fields=nextPageToken,files(id,name,mimeType,createdTime)&key=${key}${pageToken ? '&pageToken=' + pageToken : ''}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Drive API ' + r.status);
    const j = await r.json();
    for (const f of j.files || []) {
      if (f.mimeType === 'application/vnd.google-apps.folder') {
        if (depth < 2) out.push(...(await viaApi(f.id, key, depth + 1)));
      } else out.push({ id: f.id, name: f.name, mime: f.mimeType, created: f.createdTime });
    }
    pageToken = j.nextPageToken || '';
  } while (pageToken);
  return out;
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function viaPublicView(folderId, depth = 0) {
  const r = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DharshikGallery/1.0)' },
  });
  if (!r.ok) throw new Error('Folder view ' + r.status);
  const html = await r.text();
  const out = [];
  const parts = html.split(/<div class="flip-entry"/).slice(1);
  for (const part of parts) {
    const id = (part.match(/id="entry-([\w-]+)"/) || [])[1];
    const name = decode((part.match(/class="flip-entry-title">([^<]*)</) || [])[1] || '');
    if (!id) continue;
    if (/\/drive\/folders\//.test(part) || /\/folderview\?id=/.test(part)) {
      if (depth < 2) out.push(...(await viaPublicView(id, depth + 1)));
      continue;
    }
    out.push({ id, name, mime: IMG.test(name) ? 'image' : VID.test(name) ? 'video' : '' });
  }
  return out;
}

module.exports = async (req, res) => {
  const type = req.query.type === 'videos' ? 'videos' : 'photos';
  try {
    const key = process.env.GOOGLE_API_KEY;
    let items = key ? await viaApi(FOLDERS[type], key) : await viaPublicView(FOLDERS[type]);
    items = items.filter((f) => {
      const isImg = /^image/.test(f.mime) || IMG.test(f.name);
      const isVid = /^video/.test(f.mime) || VID.test(f.name);
      return type === 'photos' ? isImg || (!isVid && !f.mime) : isVid || (!isImg && !f.mime);
    });
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    res.status(200).json({ type, count: items.length, items });
  } catch (e) {
    res.setHeader('Cache-Control', 's-maxage=30');
    res.status(502).json({ type, items: [], error: String(e.message || e) });
  }
};
