import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://samuday-mela-user.vercel.app/sitemap.xml',
    host: 'https://samuday-mela-user.vercel.app',
  };
}
