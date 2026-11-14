// Tells Bing (and the other IndexNow engines) that pages changed, so they recrawl them within hours instead of weeks.
// ChatGPT Search and Copilot answer from Bing's index. Run after a deploy that adds or edits pages: npm run indexnow
// The key is public on purpose: public/1ef79b66c0aa09203317528a40bac787.txt proves we own the site.
const SITE = process.env.SITE_URL || "https://seenlense.com";
const KEY = "1ef79b66c0aa09203317528a40bac787";

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} for ${urlList.length} URLs`);
if (!res.ok) process.exit(1);
