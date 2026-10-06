import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { I18nProvider, useI18n } from './i18n';
import { pathLang } from './i18n/paths';
import { SUPPORTED_LANGUAGE_CODES, siteConfig } from './config/site';
import { STATIC_PAGES, TOOL_PAGES } from './config/pages';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ConsentBanner } from './components/ConsentBanner';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { trackPageView } from './services/analytics';
import Home from './pages/Home';
import ReportPage from './pages/ReportPage';

const ToolLanding = lazy(() => import('./pages/ToolLanding'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Keeps the i18n language, scroll position and analytics in sync with the URL. */
function RouteEffects() {
  const location = useLocation();
  const { lang, setLang } = useI18n();

  useEffect(() => {
    const segment = pathLang(location.pathname);
    if (segment && segment !== lang && SUPPORTED_LANGUAGE_CODES.has(segment)) {
      setLang(segment);
    }
  }, [location.pathname, lang, setLang]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

function AppLayout() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <RouteEffects />
      <a href="#main" className="skip-link">
        {t('common.skipToContent')}
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <LoadingSkeleton />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ConsentBanner />
    </div>
  );
}

/** `/mai` and friends → localized home; unknown prefixes → 404. */
function LangRoot() {
  const { lang } = useParams();
  if (!lang || !SUPPORTED_LANGUAGE_CODES.has(lang)) return <NotFound />;
  return <Home />;
}

const LEGAL_BY_KEY: Record<string, 'privacy' | 'terms' | 'disclaimer'> = {
  privacy: 'privacy',
  terms: 'terms',
  disclaimer: 'disclaimer',
};

function staticElement(contentKey: string) {
  switch (contentKey) {
    case 'about':
      return <About />;
    case 'contact':
      return <Contact />;
    default:
      return <LegalPage kind={LEGAL_BY_KEY[contentKey] ?? 'disclaimer'} />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="report/:id" element={<ReportPage />} />

        {TOOL_PAGES.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<ToolLanding contentKey={page.contentKey} />}
          />
        ))}
        {STATIC_PAGES.map((page) => (
          <Route key={page.path} path={page.path} element={staticElement(page.contentKey)} />
        ))}

        <Route path=":lang" element={<LangRoot />} />
        {TOOL_PAGES.map((page) => (
          <Route
            key={`lang-${page.path}`}
            path={`:lang/${page.path}`}
            element={<ToolLanding contentKey={page.contentKey} />}
          />
        ))}
        {STATIC_PAGES.map((page) => (
          <Route
            key={`lang-${page.path}`}
            path={`:lang/${page.path}`}
            element={staticElement(page.contentKey)}
          />
        ))}
        <Route path=":lang/report/:id" element={<ReportPage />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </I18nProvider>
  );
}

export { siteConfig };
