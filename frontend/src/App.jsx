import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Community from './pages/Community';
import Discover from './pages/Discover';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import ProjectDetails from './pages/ProjectDetails';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from 'framer-motion';
/* eslint-enable no-unused-vars */

// Lazy-load the 3D background so it doesn't block first paint
const CosmicBackground = lazy(() => import('./components/CosmicBackground'));

// Only redirect to onboarding if the user IS logged in but hasn't completed their profile
function OnboardingGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user && !user.has_profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes — no guard */}
        <Route path="/" element={<motion.div {...pageVariants}><Landing /></motion.div>} />
        <Route path="/discover" element={<motion.div {...pageVariants}><Discover /></motion.div>} />
        <Route path="/community" element={<motion.div {...pageVariants}><Community /></motion.div>} />
        <Route path="/onboarding" element={<motion.div {...pageVariants}><Onboarding /></motion.div>} />
        <Route path="/projects/:id" element={<motion.div {...pageVariants}><ProjectDetails /></motion.div>} />
        
        {/* Protected routes — require completed profile */}
        <Route path="/profile" element={
          <OnboardingGuard>
            <motion.div {...pageVariants}><Profile /></motion.div>
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
          {/* 3D Cosmic particle background — lazy loaded */}
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
            <main className="flex-grow">
              <AnimatedRoutes />
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
