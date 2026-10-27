
import { mkdir, rm, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
const assetPath = path.join(root, 'assets');
const assets = await readdir(assetPath, { withFileTypes: true });
if (assets.some(entry => !entry.isFile() || /\.pdf$/i.test(entry.name))) throw new Error('assets debe contener solo archivos web finales, sin PDF ni subcarpetas.');
const source = await readFile(path.join(root, 'index.html'), 'utf8');
if (/\.pdf(?:["?#]|$)/i.test(source)) throw new Error('Se encontró un enlace a PDF no autorizado.');
const rawHost = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
let origin = '';
if (rawHost) {
  const url = new URL(rawHost.includes('://') ? rawHost : 'https://' + rawHost);
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('SITE_URL debe usar HTTPS.');
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_URL debe ser solo el dominio, sin rutas, parámetros ni credenciales.');
  origin = url.origin;
}
const preview = process.env.VERCEL_ENV === 'preview';
if (process.env.VERCEL_ENV === 'production' && !origin) throw new Error('Define SITE_URL o activa las variables de sistema de Vercel para generar el SEO del dominio definitivo.');
if (path.dirname(out) !== root || path.basename(out) !== 'dist') throw new Error('Directorio de salida inválido.');
await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, 'assets'), { recursive: true });
// Only final web resources are copied. Documentation and source material stay private.
for (const file of ['styles.css', 'script.js', 'fonts.css', 'FONT-LICENSES.txt']) await copyFile(path.join(root, file), path.join(out, file));
for (const entry of assets) await copyFile(path.join(assetPath, entry.name), path.join(out, 'assets', entry.name));
let html = source;
if (origin) {
  html = html.replace('rel="canonical" href="/"', 'rel="canonical" href="' + origin + '/"')
    .replace('property="og:url" content="/"', 'property="og:url" content="' + origin + '/"')
    .replaceAll('content="./assets/compartir-eccobass.jpg"', 'content="' + origin + '/assets/compartir-eccobass.jpg"');
  html = html.replace(/(<script id="organization-data" type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, open, json, close) => {
    const data = JSON.parse(json);
    data.url = origin + '/';
    data['@id'] = origin + '/#organization';
    data.logo = origin + '/assets/logo.webp';
    data.image = origin + '/assets/compartir-eccobass.jpg';
    return open + JSON.stringify(data) + close;
  });
}
if (preview || !origin) html = html.replace('content="index,follow,max-image-preview:large"', 'content="noindex,follow,max-image-preview:large"');
await writeFile(path.join(out, 'index.html'), html, 'utf8');
await writeFile(path.join(out, 'robots.txt'), preview || !origin ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\nSitemap: ' + origin + '/sitemap.xml\n', 'utf8');
const sitemap = origin && !preview ? '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + origin + '/</loc></url></urlset>\n' : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
await writeFile(path.join(out, 'sitemap.xml'), sitemap, 'utf8');
console.log(origin ? 'Web preparada para ' + origin + (preview ? ' (vista previa sin indexar)' : '') : 'Web preparada para revisión local; el dominio SEO se configura al desplegar.');
