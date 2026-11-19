import { motion, useReducedMotion } from 'motion/react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { RouterProvider, useRouter } from './components/RouterContext';
import { ThemeProvider } from './components/ThemeContext';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { WorkPage } from './pages/WorkPage';

function PageView() {
  const { route, pathname } = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const renderPage = () => {
    switch (route.name) {
      case 'home':
        return <HomePage />;
      case 'work':
        return <WorkPage />;
      case 'project':
        return <ProjectDetailPage slug={route.slug} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'not-found':
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1A1A1A] dark:bg-[#0A0A0A] dark:text-[#F0F0EE] transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-[#1A1A1A] focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="flex-1">
        <motion.div
          key={pathname}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderPage()}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <PageView />
      </RouterProvider>
    </ThemeProvider>
  );
}
