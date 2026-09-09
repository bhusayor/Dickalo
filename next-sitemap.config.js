/**
 * next-sitemap runs after `next build` and writes a static sitemap alongside
 * the App Router's dynamic one. Belt and braces: if the CMS is unreachable at
 * request time, the static file still lists every page that existed at build.
 *
 * It writes to `public/sitemap-static.xml`, NOT `sitemap.xml` — a static file
 * at that path would collide with `app/sitemap.ts` and fail the build. Both are
 * listed in robots.txt, so search engines read whichever is fresher.
 *
 * robots.txt generation is off here for the same reason: `app/robots.ts` owns it.
 *
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
  sourceDir: process.env.NEXT_DIST_DIR || '.next',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dickalo.com',
  generateRobotsTxt: false,
  generateIndexSitemap: false,
  sitemapBaseFileName: 'sitemap-static',
  changefreq: 'monthly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/studio', '/studio/*', '/api/*', '/contact/thank-you'],

  transform: async (config, path) => {
    // Homepage and portfolio carry the most search value.
    const priority = path === '/' ? 1.0 : path.startsWith('/projects') ? 0.9 : config.priority;

    return {
      loc: path,
      changefreq: path.startsWith('/projects') ? 'weekly' : config.changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
