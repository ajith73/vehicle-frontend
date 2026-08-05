import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  schema?: any;
  noindex?: boolean;
}

export function SEO({
  title = 'RoadResQ | 24/7 Roadside Assistance in Tamil Nadu',
  description = 'RoadResQ provides fast roadside assistance across Tamil Nadu including mechanics, towing, puncture repair, battery jump-start, fuel delivery, and emergency vehicle support.',
  keywords = '24/7 roadside assistance near me, car towing service, bike towing service near me, emergency car repair, flat tire repair, car battery jump start, car mechanic open now, RoadResQ, Tamil Nadu, Coimbatore, Chennai, Madurai, Salem',
  image = 'https://roadresq.in/social-share.png',
  url = 'https://roadresq.in',
  schema,
  noindex = false,
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
