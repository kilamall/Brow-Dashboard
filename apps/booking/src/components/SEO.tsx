import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: any;
}

export default function SEO({
  title = 'Bueno Brows - Professional Eyebrow Services | Book Online',
  description = 'Professional eyebrow services in San Mateo, CA. Expert microblading, brow shaping, and beauty treatments. Book your appointment online today!',
  keywords = 'eyebrow services, microblading, brow shaping, San Mateo, beauty salon, eyebrow specialist, brow tattoo, semi-permanent makeup',
  image = 'https://buenobrows.com/og-image.jpg',
  url = 'https://buenobrows.com',
  type = 'website',
  structuredData
}: SEOProps) {
  const fullTitle = title.includes('Bueno Brows') ? title : `${title} | Bueno Brows`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Bueno Brows" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

