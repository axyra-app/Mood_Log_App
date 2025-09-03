import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({
  title = 'Mood Log App - Registro de Estado de Ánimo',
  description = 'Aplicación para registrar y analizar tu estado de ánimo diario. Conecta con psicólogos y mejora tu bienestar mental.',
  keywords = 'estado de ánimo, bienestar mental, psicología, terapia, mood tracking, salud mental',
  image = '/og-image.png',
  url = window.location.href,
  type = 'website',
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='author' content='Mood Log App' />
      <meta name='robots' content='index, follow' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:url' content={url} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
      <meta property='og:site_name' content='Mood Log App' />
      <meta property='og:locale' content='es_ES' />

      {/* Twitter */}
      <meta property='twitter:card' content='summary_large_image' />
      <meta property='twitter:url' content={url} />
      <meta property='twitter:title' content={title} />
      <meta property='twitter:description' content={description} />
      <meta property='twitter:image' content={image} />

      {/* Additional Meta Tags */}
      <meta name='theme-color' content='#3B82F6' />
      <meta name='msapplication-TileColor' content='#3B82F6' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      <meta name='apple-mobile-web-app-title' content='Mood Log' />

      {/* Canonical URL */}
      <link rel='canonical' href={url} />

      {/* Preconnect to external domains */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      <link rel='preconnect' href='https://www.google-analytics.com' />
      <link rel='preconnect' href='https://browser.sentry-cdn.com' />
    </Helmet>
  );
};

export default SEO;
