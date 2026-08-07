import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import PublicSsrApp from './ssr/PublicSsrApp';
import './index.css';

function extractLeadingHeadTags(html: string) {
  const pattern = /^(?:(<title>.*?<\/title>|<meta[^>]*?>|<link[^>]*?>)\s*)+/s;
  const match = html.match(pattern);

  if (!match) {
    return { bodyHtml: html, inlineHead: '' };
  }

  return {
    bodyHtml: html.slice(match[0].length),
    inlineHead: match[0],
  };
}

export function render(url: string) {
  const helmetContext: { helmet?: any } = {};

  const rawHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <PublicSsrApp url={url} />
    </HelmetProvider>
  );
  const { bodyHtml, inlineHead } = extractLeadingHeadTags(rawHtml);

  const helmet = helmetContext.helmet;
  const head = [
    helmet?.title?.toString() ?? '',
    helmet?.meta?.toString() ?? '',
    helmet?.link?.toString() ?? '',
    helmet?.script?.toString() ?? '',
    inlineHead,
  ].join('');

  return { html: bodyHtml, head };
}

export { citySeoConfigs, serviceSeoConfigs } from './content/seoLocations';
