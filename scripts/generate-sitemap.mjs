import { writeFileSync } from 'fs';
import { format } from 'date-fns';

const baseUrl = 'https://www.youtube-to-mp3.net';

const pages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/mp4', priority: '0.9', changefreq: 'weekly' },
  { url: '/app', priority: '0.9', changefreq: 'weekly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  // 以下页面不在主导航中，但仍可访问
  { url: '/about', priority: '0.5', changefreq: 'monthly' },
  { url: '/changelog', priority: '0.5', changefreq: 'monthly' },
  { url: '/terms', priority: '0.4', changefreq: 'yearly' },
  { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
];

const currentDate = format(new Date(), 'yyyy-MM-dd');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

writeFileSync('public/sitemap.xml', sitemapContent);

console.log('Sitemap generated successfully!');