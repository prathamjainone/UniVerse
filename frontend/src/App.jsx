import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import { AuthProvider, useAuth } from './context/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from 'framer-motion';
/* eslint-enable no-unused-vars */

// ── Lazy-load ALL heavy page components for code splitting ──
const CosmicBackground = lazy(() => import('./components/CosmicBackground'));
const Landing = lazy(() => import('./pages/Landing'));
const Community = lazy(() => import('./pages/Community'));
const Discover = lazy(() => import('./pages/Discover'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Profile = lazy(() => import('./pages/Profile'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));

// ── Lightweight CSS-only loading fallback (no WebGL, instant paint) ──
function CosmicFallback() {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden="true"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(112,0,255,0.08) 0%, rgba(0,240,255,0.03) 40%, #030303 100%)',
        pointerEvents: 'none',
      }}
    />
  );
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin"></div>
    </div>
  );
}

// Only redirect to onboarding if the user IS logged in but hasn't completed their profile
function OnboardingGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user && !user.has_profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
}

// ── Simplified page transitions: opacity-only (no y translation = no layout shift) ──
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes — no guard */}
        <Route path="/" element={<Suspense fallback={<PageFallback />}><motion.div {...pageVariants}><Landing /></motion.div></Suspense>} />
        <Route path="/discover" element={<Suspense fallback={<PageFallback />}><motion.div {...pageVariants}><Discover /></motion.div></Suspense>} />
        <Route path="/community" element={<Suspense fallback={<PageFallback />}><motion.div {...pageVariants}><Community /></motion.div></Suspense>} />
        <Route path="/onboarding" element={<Suspense fallback={<PageFallback />}><motion.div {...pageVariants}><Onboarding /></motion.div></Suspense>} />
        <Route path="/projects/:id" element={<Suspense fallback={<PageFallback />}><motion.div {...pageVariants}><ProjectDetails /></motion.div></Suspense>} />
        
        {/* Protected routes — require completed profile */}
        <Route path="/profile" element={
          <OnboardingGuard>
            <Suspense fallback={<PageFallback />}><motion.div {...pageVariants}><Profile /></motion.div></Suspense>
          </OnboardingGuard>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-bg text-slate-100 font-sans relative overflow-x-hidden">
          {/* 3D Cosmic particle background — lazy loaded with CSS fallback */}
          <CosmicFallback />
          <Suspense fallback={null}>
            <CosmicBackground />
          </Suspense>

          {/* Film grain noise overlay */}
          <div className="grain-overlay" aria-hidden="true"></div>

          {/* Ambient mesh gradient overlay for additional depth */}
          <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
            <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-neon-purple/[0.04] rounded-full blur-[180px] animate-float-slow"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-neon-blue/[0.03] rounded-full blur-[160px] animate-float" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow relative">
              {/* Dark scrim behind content to block cosmic stars from bleeding through text */}
              <div className="absolute inset-0 bg-dark-bg/70 pointer-events-none" aria-hidden="true"></div>
              <div className="relative z-[1]">
                <AnimatedRoutes />
              </div>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
