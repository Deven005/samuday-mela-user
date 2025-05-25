// next-sitemap.config.ts

const siteUrl = process.env.SITE_URL || 'http://localhost:3000'; // ✅ Required!

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: ['/profile', '/api/*'],
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000, // Number of URLs per sitemap file
};
