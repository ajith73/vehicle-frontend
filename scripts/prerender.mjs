import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distRoot = path.join(projectRoot, 'dist');
const serverEntryPath = path.join(distRoot, 'server', 'entry-server.js');

const publicRoutes = [
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
  '/cities/coimbatore',
  '/cities/chennai',
  '/cities/madurai',
  '/cities/trichy',
  '/cities/salem',
  '/cities/erode',
  '/services/car-mechanic/in/coimbatore',
  '/services/car-mechanic/in/chennai',
  '/services/car-mechanic/in/madurai',
  '/services/car-mechanic/in/trichy',
  '/services/car-mechanic/in/salem',
  '/services/car-mechanic/in/erode',
  '/services/bike-mechanic/in/coimbatore',
  '/services/bike-mechanic/in/chennai',
  '/services/bike-mechanic/in/madurai',
  '/services/bike-mechanic/in/trichy',
  '/services/bike-mechanic/in/salem',
  '/services/bike-mechanic/in/erode',
  '/services/towing/in/coimbatore',
  '/services/towing/in/chennai',
  '/services/towing/in/madurai',
  '/services/towing/in/trichy',
  '/services/towing/in/salem',
  '/services/towing/in/erode',
];

const { render } = await import(pathToFileURL(serverEntryPath).href);
const template = await fs.readFile(path.join(distRoot, 'index.html'), 'utf-8');

for (const route of publicRoutes) {
  const { html, head } = render(route);
  const finalHtml = template
    .replace('<!--ssr-head-->', head)
    .replace('<!--ssr-outlet-->', html);

  const targetDir = route === '/' ? distRoot : path.join(distRoot, route.replace(/^\//, ''));
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, 'index.html'), finalHtml, 'utf-8');
}
