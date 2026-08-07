import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distRoot = path.join(projectRoot, 'dist');
const serverEntryPath = path.join(distRoot, 'server', 'entry-server.js');

// Minimal browser mocks for SSR compatibility with third-party libraries
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    location: {
      href: 'https://roadresq.in',
      origin: 'https://roadresq.in',
      protocol: 'https:',
      host: 'roadresq.in',
      hostname: 'roadresq.in',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
    },
  };
}
if (typeof globalThis.document === 'undefined') {
  const mockChild = {
    data: '',
  };
  const mockElement = {
    style: {},
    appendChild: function(child) { return child; },
    parentNode: null,
    firstChild: mockChild,
    nonce: '',
    querySelector: () => mockElement,
  };
  globalThis.document = {
    createElement: () => mockElement,
    getElementsByTagName: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    head: mockElement,
    body: mockElement,
  };
}
try {
  if (typeof globalThis.navigator === 'undefined') {
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: '' },
      writable: true,
      configurable: true
    });
  }
} catch (e) {}

const serverEntryModule = await import(pathToFileURL(serverEntryPath).href);
const { render, citySeoConfigs, serviceSeoConfigs } = serverEntryModule;

const staticRoutes = [
  '/',
  '/emergency',
  '/feedback',
  '/donate',
  '/contact',
  '/about',
  '/list',
  '/submit',
  '/terms',
  '/privacy',
  '/verify-start',
];

const dynamicRoutes = [];
for (const city of citySeoConfigs) {
  dynamicRoutes.push(`/cities/${city.slug}`);
  for (const service of serviceSeoConfigs) {
    dynamicRoutes.push(`/services/${service.slug}/in/${city.slug}`);
  }
}

const publicRoutes = [...staticRoutes, ...dynamicRoutes];
const template = await fs.readFile(path.join(distRoot, 'index.html'), 'utf-8');

console.log(`Pre-rendering ${publicRoutes.length} pages...`);

for (const route of publicRoutes) {
  try {
    const { html, head } = render(route);
    const finalHtml = template
      .replace('<!--ssr-head-->', head)
      .replace('<!--ssr-outlet-->', html);

    const targetDir = route === '/' ? distRoot : path.join(distRoot, route.replace(/^\//, ''));
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, 'index.html'), finalHtml, 'utf-8');
  } catch (err) {
    console.error(`Error pre-rendering route ${route}:`, err);
  }
}

console.log('Generating sitemap.xml...');
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

for (const route of publicRoutes) {
  let priority = '0.8';
  let changefreq = 'weekly';
  if (route === '/') {
    priority = '1.0';
    changefreq = 'daily';
  } else if (route === '/list' || route === '/map') {
    priority = '0.9';
    changefreq = 'daily';
  } else if (route.startsWith('/cities/') || route.startsWith('/services/')) {
    priority = '0.85';
    changefreq = 'weekly';
  } else if (['/terms', '/privacy'].includes(route)) {
    priority = '0.5';
    changefreq = 'yearly';
  }

  sitemapXml += `  <url>
    <loc>https://roadresq.in${route === '/' ? '' : route}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
}
sitemapXml += `</urlset>`;

await fs.writeFile(path.join(projectRoot, 'public', 'sitemap.xml'), sitemapXml, 'utf-8');
await fs.writeFile(path.join(distRoot, 'sitemap.xml'), sitemapXml, 'utf-8');
console.log(`Successfully generated sitemap.xml with ${publicRoutes.length} entries.`);
