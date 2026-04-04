import { Link } from 'react-router-dom';
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { Users, Code, Rocket, ArrowRight, Sparkles, TerminalSquare, Github, ChevronDown, Globe, Shield, Zap } from 'lucide-react';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
      
      {/* Hero Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl mx-auto flex flex-col items-center mt-10 md:mt-20"
      >
        <motion.div variants={itemVariants} className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-neon-purple/20 blur-xl rounded-full"></div>
          <span className="relative glass px-4 py-2 rounded-full text-sm font-medium border border-neon-purple/30 text-neon-blue flex items-center gap-2">
            <Sparkles size={14} /> The Campus Network. Re-invented.
          </span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-outfit font-extrabold tracking-tighter leading-[1.1] mb-8"
        >
          Build the ultimate <br/>
          <span className="text-gradient bg-gradient-to-r from-white via-[#d4b0ff] to-neon-purple">
            student startup.
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-sans font-light leading-relaxed"
        >
          Uni-Verse breaks down branch silos. Connect with cross-disciplinary talent, 
          manage your hackathon projects in real-time, and ship beautiful products together.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/discover"
            className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            Explore Projects <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/onboarding"
            className="glass-strong px-8 py-4 font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
          >
            <Users size={18} className="text-slate-300" /> Join Community
          </Link>
        </motion.div>

        {/* Feature Highlights Bar */}
        <motion.div 
          variants={itemVariants}
          className="mt-24 w-full max-w-3xl glass-strong rounded-2xl p-6 flex justify-around items-center divide-x divide-white/10"
        >
          <div className="flex flex-col items-center px-4">
            <span className="text-3xl font-outfit font-bold text-white text-shadow-glow">⚡</span>
            <span className="text-sm text-slate-400 mt-1">Real-Time Teams</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-3xl font-outfit font-bold text-neon-blue">🔬</span>
            <span className="text-sm text-slate-400 mt-1">AI Skill Matching</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-3xl font-outfit font-bold text-neon-purple">🚀</span>
            <span className="text-sm text-slate-400 mt-1">War Room Collab</span>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Scroll to explore</span>
          <ChevronDown size={20} className="text-slate-400 animate-scroll-bounce" />
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="mt-32 w-full"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-outfit font-bold mb-4">Engineering serendipity.</h2>
          <p className="text-slate-400 text-lg">Everything you need to go from idea to deployment.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Feature 1 */}
          <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.03] transition-colors border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Users size={80} className="text-neon-teal" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-neon-teal/10 flex items-center justify-center mb-6">
              <Users size={24} className="text-neon-teal" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Branch Agnostic</h3>
            <p className="text-slate-400 leading-relaxed max-w-[90%] relative z-10">
              Stop building in an echo chamber. Connect CS students with designers from Arts and marketers from Business.
            </p>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-teal rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          </div>

          {/* Feature 2 */}
          <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.03] transition-colors border border-white/5 overflow-hidden md:translate-y-12">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Code size={80} className="text-neon-purple" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center mb-6">
              <TerminalSquare size={24} className="text-neon-purple" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">War Rooms</h3>
            <p className="text-slate-400 leading-relaxed max-w-[90%] relative z-10">
              Dedicated project spaces with integrated commit feeds, persistent chat, and real-time collaboration tools.
            </p>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-purple rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          </div>

          {/* Feature 3 */}
          <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.03] transition-colors border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Rocket size={80} className="text-neon-blue" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center mb-6">
              <Github size={24} className="text-neon-blue" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Git Analytics</h3>
            <p className="text-slate-400 leading-relaxed max-w-[90%] relative z-10">
              Vet applicants based on actual shipping history. AI analyzes GitHub stats to ensure technical fit.
            </p>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-blue rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          </div>

        </div>
      </motion.div>

      {/* Built With Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-32 w-full"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-outfit font-bold mb-3">Powered by modern tech.</h2>
          <p className="text-slate-400">Production-grade stack for production-grade products.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { name: 'React + Vite', icon: Zap, color: 'text-neon-blue' },
            { name: 'FastAPI', icon: Rocket, color: 'text-neon-teal' },
            { name: 'Firebase Auth', icon: Shield, color: 'text-neon-purple' },
            { name: 'Three.js', icon: Globe, color: 'text-neon-magenta' },
          ].map((tech) => (
            <div key={tech.name} className="glass rounded-2xl p-5 flex flex-col items-center gap-3 hover:bg-white/[0.03] transition-colors border border-white/5 group">
              <tech.icon size={28} className={`${tech.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium text-slate-300">{tech.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-32 mb-0 w-full border-t border-white/5 pt-12 pb-10"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-purple to-neon-blue flex items-center justify-center">
              <Code size={16} className="text-white" />
            </div>
            <span className="text-lg font-outfit font-bold">Uni-Verse</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link to="/discover" className="hover:text-white transition-colors">Discover</Link>
            <Link to="/community" className="hover:text-white transition-colors">Community</Link>
            <Link to="/onboarding" className="hover:text-white transition-colors">Join</Link>
          </div>
          <div className="text-xs text-slate-600">
            Built for Hackathon &bull; React &bull; Three.js &bull; Framer Motion
          </div>
        </div>
      </motion.footer>
      
    </div>
  );
}
