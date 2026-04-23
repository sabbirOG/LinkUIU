import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/settings', '/dashboard/messages'],
    },
    sitemap: 'https://linkeduiu.vercel.app/sitemap.xml',
  };
}
