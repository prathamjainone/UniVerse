import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, Users, Rocket, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Discover', path: '/discover', icon: Rocket },
    { name: 'Community', path: '/community', icon: Users },
  ];

  if (loading) return null;

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
        scrolled 
          ? 'glass-strong border-white/5 py-4' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-purple to-neon-blue flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 animate-spin-slow bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI++PC9zdmc+')] opacity-30"></div>
              <Code size={16} className="text-white relative z-10" />
            </div>
            <span className="text-2xl font-outfit font-bold tracking-tight text-white group-hover:text-neon-blue transition-colors duration-300">
              Uni-Verse
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 glass px-6 py-2 rounded-full">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-3 py-1.5 rounded-full ${
                      isActive(link.path) 
                        ? 'text-white bg-white/10' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} className={isActive(link.path) ? 'text-neon-blue' : ''} />
                    {link.name}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                      <img 
                        src={user.photo_url || `https://ui-avatars.com/api/?name=${user.email}&background=0D0D0D&color=fff`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-slate-400 hover:text-neon-magenta transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/onboarding"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/onboarding"
                    className="relative group px-5 py-2 text-sm font-medium text-white rounded-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-300 group-hover:scale-105"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/20 transition-opacity duration-300"></div>
                    <span className="relative z-10">Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-white/10 absolute top-full left-0 w-full overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive(link.path) 
                        ? 'bg-white/10 text-white' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className={isActive(link.path) ? 'text-neon-blue' : ''} />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                )
              })}
              
              <div className="h-px bg-white/10 my-2"></div>
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Profile Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-neon-magenta transition-colors text-left"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Log Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium shadow-lg shadow-neon-purple/20"
                >
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
