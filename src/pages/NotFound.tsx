import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  const { t, lang } = useI18n();
  const home = localizePath('/', lang, siteConfig.defaultLanguage);

  return (
    <>
      <SEOHead
        title={`${t('notFoundPage.title')} — ${siteConfig.name}`}
        description={t('notFoundPage.text')}
        path="/404"
        noindex
      />
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="text-7xl font-extrabold tracking-tight text-brand-700">404</span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-950">{t('notFoundPage.title')}</h1>
        <p className="mt-3 text-ink-700/80">{t('notFoundPage.text')}</p>
        <Link to={home} className="mt-8">
          <Button>{t('notFoundPage.home')}</Button>
        </Link>
      </div>
    </>
  );
}
