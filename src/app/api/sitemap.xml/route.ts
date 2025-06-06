import { getAllCommunitiesSlugs } from '@/app/utils/communities/communities';
import { getAllPostSlugs, getAllUserSlugs } from '@/app/utils/post/post';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { origin } = req.nextUrl;
  //   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // --- Static Routes ---
  const staticRoutes = [
    '',
    '/about',
    '/communities',
    '/contact',
    '/faq',
    '/legal',
    '/legal/community',
    '/legal/cookies',
    '/legal/data-deletion',
    '/legal/privacy',
    '/legal/refund',
    '/legal/terms',
    '/posts',
    '/posts/add',
    '/sign-in',
    '/sign-up',
  ];

  const staticUrls = staticRoutes.map(
    (path) => `
    <url>
      <loc>${origin}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>0.8</priority>
      <changefreq>weekly</changefreq>
    </url>`,
  );

  // --- Dynamic Routes ---
  const posts = await getAllPostSlugs(); // returns array of { slug, updatedAt }
  const users = await getAllUserSlugs(); // same format
  const communities = await getAllCommunitiesSlugs();

  const dynamicUrls = [
    ...posts.map(
      (post) => `
      <url>
        <loc>${origin}/posts/${post.slug}</loc>
        <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
        <priority>0.9</priority>
        <changefreq>daily</changefreq>
      </url>`,
    ),
    ...users.map(
      (user) => `
      <url>
        <loc>${origin}/user/${user.slug}</loc>
        <lastmod>${new Date(user.updatedAt).toISOString()}</lastmod>
        <priority>0.6</priority>
        <changefreq>monthly</changefreq>
      </url>`,
    ),
    ...communities.map(
      (community) => `
      <url>
        <loc>${origin}/communities/${community.slug}</loc>
        <lastmod>${new Date(community.updatedAt).toISOString()}</lastmod>
        <priority>0.6</priority>
        <changefreq>monthly</changefreq>
      </url>`,
    ),
  ];

  // --- Combine + Return Full Sitemap ---
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${[...staticUrls, ...dynamicUrls].join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
