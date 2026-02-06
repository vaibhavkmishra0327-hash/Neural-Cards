import { Helmet } from 'react-helmet';
import { SEOContent } from '../types';

interface SEOHeadProps {
  seo: SEOContent;
}

export function SEOHead({ seo }: SEOHeadProps) {
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content="website" />
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

      {/* Schema.org structured data */}
      {seo.schema && <script type="application/ld+json">{JSON.stringify(seo.schema)}</script>}
    </Helmet>
  );
}
