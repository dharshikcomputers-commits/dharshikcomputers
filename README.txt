DHARSHIK COMPUTERS WEBSITE
==========================

DEPLOY (Vercel, free)
1. Go to vercel.com > Add New > Project.
2. Drag in this whole "dharshik-computers" folder (or push it to GitHub and import it).
   Framework preset: Other. No build command needed.
3. Done. The gallery's /api/gallery function is picked up automatically.

GALLERY (Google Drive)
- Photos folder: https://drive.google.com/drive/folders/102APOgyjvXjVheAKbh5hKoPJQ38trA97
- Videos folder: https://drive.google.com/drive/folders/1u8xeYLw0fCrC7PJFsbxAKPEO7_P_oV_q
- Just add files to these folders. They appear on the site within about 5 minutes.
- Both folders AND the files must stay shared as "Anyone with the link can view".
- File names become captions (e.g. "Dell motherboard repair.jpg" shows "Dell motherboard repair").
- Sub-folders inside the main folders are included too.
- Videos play inside the site using Google Drive's player. Very new uploads may say
  "still processing" for a few minutes.

OPTIONAL: MORE RELIABLE GALLERY
Without setup, the site reads Google's public folder page. If Google ever changes that page,
add a free Drive API key instead:
  Google Cloud Console > new project > enable "Google Drive API" > Credentials > Create API key.
  In Vercel > Project > Settings > Environment Variables, add GOOGLE_API_KEY = <your key>, then redeploy.
  This also sorts the gallery newest-first.
To use different folders later, set PHOTOS_FOLDER_ID / VIDEOS_FOLDER_ID the same way.

Netlify or plain hosting: the site works, but the gallery needs the /api function,
so it will show "open the folders" buttons instead. Use Vercel for the live gallery.

SWAP PHOTOS
Replace files in img/ keeping the same names: owner.jpg (Dinesh V), shopfront.jpg, shop1.jpg,
laptop.jpg, desktop.jpg, parts.jpg, map.jpg, mark.png (logo).
