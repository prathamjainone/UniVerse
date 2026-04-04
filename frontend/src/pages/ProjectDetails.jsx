import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, MessageSquare, ArrowLeft, Sparkles,
  Send, Mail, Trash2, Github, ExternalLink, X, Star, BookOpen, Code, BarChart3
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  Radar as RadarComponent, ResponsiveContainer
} from 'recharts';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { useAuth } from '../context/AuthContext';
import API_URL from '../api';
import WarRoomChat from '../components/WarRoomChat';
import ContributionTracker from '../components/ContributionTracker';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, login, onlineUsers = [] } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  // URL-based tab state
  const activeTab = searchParams.get('tab') || "discussion";
  const setActiveTab = (tab) => setSearchParams({ tab });

  // --- GitHub Intel Modal State ---
  const [intelModal, setIntelModal] = useState(null); // { name, github, ... } or null
  const [intelData, setIntelData] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);

  const [error, setError] = useState(null);

  const isMember = project?.members?.includes(user?.uid);
  const isRequested = project?.join_requests?.includes(user?.uid);

  const fetchProject = async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.project);
        setError(null);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      console.error("Fetch error", err);
      if (!project) setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    
    // Throttle polling to save Firebase Reads: 
    // 1. Only poll if the tab is visible
    // 2. Increase interval from 5s to 30s
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProject();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchProject();
      }
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id]);

  const handleAddComment = async () => {
    if (!user) return login();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/projects/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          user_name: user.display_name,
          text: commentText
        })
      });
      if (res.ok) {
        setCommentText("");
        fetchProject();
      }
    } catch (err) {
      console.error("Comment error", err);
    }
  };

  const handleMatch = async () => {
    if (!user) return login();
    setIsMatching(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.uid, skills: user.skills || [] })
      });
      const data = await res.json();
      if (data.success) setMatchResult(data.match);
    } catch (err) {
      console.error("Match error", err);
    } finally {
      setIsMatching(false);
    }
  };




  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) navigate('/discover');
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const handleJoin = async () => {
    if (!user) return login();
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.uid })
      });
      const data = await res.json();
      if (data.success) {
        fetchProject();
      }
    } catch (err) {
      console.error("Failed to join project", err);
    }
  };

  const handleAccept = async (requestUid) => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}/requests/${requestUid}/accept`, {
        method: 'POST'
      });
      if (res.ok) fetchProject();
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };

  const handleReject = async (requestUid) => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}/requests/${requestUid}/reject`, {
        method: 'POST'
      });
      if (res.ok) fetchProject();
    } catch (err) {
      console.error("Failed to reject request", err);
    }
  };

  const handleRemoveMember = async (memberUid) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}/members/${memberUid}`, { method: 'DELETE' });
      if (res.ok) fetchProject();
    } catch (err) {
      console.error("Failed to remove member", err);
    }
  };

  // --- GitHub Intel ---
  const openGithubIntel = async (person) => {
    let username = person.github || '';
    if (!username) { alert('This user has not linked a GitHub account.'); return; }
    if (username.includes('github.com/')) username = username.split('github.com/')[1].split('/')[0];
    username = username.replace(/\/$/, '');
    if (!username) { alert('Invalid GitHub username.'); return; }

    setIntelModal(person);
    setIntelData(null);
    setIntelLoading(true);

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
      ]);
      if (!userRes.ok) throw new Error('User not found');
      const userData = await userRes.json();
      const reposData = reposRes.ok ? await reposRes.json() : [];

      const totalStars = reposData.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      const languages = {};
      reposData.forEach(r => { if (r.language) languages[r.language] = (languages[r.language] || 0) + 1; });
      const topLangs = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 8);
      const topRepos = reposData.filter(r => !r.fork).sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 5);

      setIntelData({
        avatar: userData.avatar_url,
        login: userData.login,
        bio: userData.bio,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        totalStars,
        topLangs,
        topRepos,
        profileUrl: userData.html_url
      });
    } catch (err) {
      setIntelData({ error: err.message });
    } finally {
      setIntelLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!project) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="glass-strong rounded-3xl p-10 border border-white/5 max-w-md text-center">
        <div className="text-5xl mb-4">🔭</div>
        <h2 className="text-xl font-bold text-white mb-2">{error || 'Project not found'}</h2>
        <p className="text-slate-400 text-sm mb-6">
          {error === 'Could not connect to server' 
            ? 'The backend server might be offline. Please try again later.'
            : 'This project may have been removed or the link is incorrect.'
          }
        </p>
        <Link to="/discover" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeft size={16} /> Back to Discover
        </Link>
      </div>
    </div>
  );

  // Prepare Radar Data
  const radarData = (project.required_skills || []).map(skill => ({
    subject: skill,
    A: user?.skills?.includes(skill) ? 100 : 20,
    fullMark: 100,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 pt-28 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">

      {/* Back Navigation */}
      <Link to="/discover" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Discovery</span>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Project Content Card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-4">
              {user && project.owner_uid === user.uid && (
                <button onClick={handleDelete} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold border border-teal-500/20 uppercase tracking-wider">
                  Open Project
                </div>
                <span className="text-slate-500 text-xs">• Posted {new Date(project.created_at).toLocaleDateString()}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                {project.title}
              </h1>

              <div className="prose prose-invert max-w-none mb-8 text-slate-300 leading-relaxed text-lg">
                {project.description}
              </div>

              <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Users size={18} />
                  <span className="font-semibold">{project.members?.length || 1} Members</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <MessageSquare size={18} />
                  <span className="font-semibold">{project.comments?.length || 0} Discussions</span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB SYSTEM */}
          <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("discussion")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'discussion' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Discussion
            </button>
            {isMember && (
              <button
                onClick={() => setActiveTab("warroom")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'warroom' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Team War Room <Sparkles size={14} />
              </button>
            )}
            {isMember && (
              <button
                onClick={() => setActiveTab("contributions")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'contributions' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Contributions <BarChart3 size={14} />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'discussion' ? (
              <motion.div
                key="discussion"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <MessageSquare size={20} className="text-teal-400" />
                  Community Discussion
                </h3>

                {/* Comment Box */}
                <div className="mb-8">
                  <textarea
                    placeholder={user ? "What are your thoughts?" : "Sign in to join the conversation..."}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 min-h-[120px] transition-all"
                    disabled={!user}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleAddComment}
                      disabled={!user || !commentText.trim()}
                      className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg overflow-hidden relative group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Post Comment <Send size={14} />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {project.comments?.map((c, idx) => (
                    <div key={c.id || idx} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shrink-0 shadow-lg">
                        {c.user_name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-100 text-sm">{c.user_name}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter self-center py-0.5 px-1.5 bg-white/5 rounded">Student</span>
                          <span className="text-[10px] text-slate-600 ml-auto">
                            {c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!project.comments || project.comments.length === 0) && (
                    <div className="text-center py-8 text-slate-500 italic">
                      Be the first to start a conversation!
                    </div>
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'warroom' ? (
              <motion.div
                key="warroom"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <WarRoomChat project={project} user={user} />
              </motion.div>
            ) : (
              <motion.div
                key="contributions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <ContributionTracker projectId={id} isOwner={user && project.owner_uid === user.uid} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="space-y-6">

          {/* AI Match Card */}
          <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>

            <h4 className="text-sm font-black text-purple-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Sparkles size={16} /> AI Match Readiness
            </h4>

            {matchResult ? (
              <div className="space-y-4">
                {radarData.length > 0 && (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#4a5568" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <RadarComponent
                          name="Skills"
                          dataKey="A"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="flex justify-between items-center bg-purple-500/20 rounded-xl p-3 border border-purple-500/30">
                  <span className="text-sm font-bold text-white">Probability</span>
                  <span className="text-2xl font-black text-purple-400">{matchResult.score}%</span>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed text-center">
                  "{matchResult.reason}"
                </p>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-slate-400 text-xs mb-4">See how your skills stack up against this project's requirements.</p>
                <button
                  onClick={handleMatch}
                  disabled={isMatching}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isMatching ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Scoring...</> : 'Evaluate Compatibility'}
                </button>
              </div>
            )}
          </div>

          {/* Team Members Card — high-fidelity style matching ContributionTracker */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Gradient header strip */}
            <div className="p-5 bg-gradient-to-r from-teal-500/10 to-cyan-500/5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/20 rounded-xl">
                    <Users size={18} className="text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      Current Team
                    </h3>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-bold rounded-lg border border-teal-500/20">
                  <span className="inline-block w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                  {project.members_info?.length || 0} Active
                </span>
              </div>
            </div>

            {/* Member list body */}
            <div className="p-5 space-y-3">
              {project.members_info?.map((m, idx) => {
                const isOwner = m.uid === project.owner_uid;
                const isOnline = onlineUsers.includes(m.uid);
                return (
                  <motion.div
                    key={m.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-teal-500/20 transition-all group"
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative shrink-0">
                      {m.photo_url ? (
                        <img
                          src={m.photo_url}
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/10 group-hover:border-teal-500/30 transition-colors"
                        />
                      ) : null}
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${isOwner ? 'from-teal-500 to-cyan-600' : 'from-slate-700 to-slate-800'} flex items-center justify-center text-xs font-black text-white border-2 border-white/10 group-hover:border-teal-500/30 transition-colors`}
                        style={m.photo_url ? { display: 'none' } : {}}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-black/80 ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-600'}`}
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-white truncate">{m.name}</p>
                        {isOwner ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-teal-500/10 text-teal-400 text-[9px] font-bold rounded border border-teal-500/20 shrink-0">
                            <Sparkles size={8} /> LEAD
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 text-slate-500 text-[9px] font-bold rounded border border-white/5 shrink-0">
                            MEMBER
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{m.branch || 'University Student'}</p>
                    </div>

                    {/* Action buttons — revealed on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user && project.owner_uid === user.uid && m.github && (
                        <button onClick={() => openGithubIntel(m)} className="p-1.5 text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="GitHub Intel">
                          <Github size={14} />
                        </button>
                      )}
                      {user && project.owner_uid === user.uid && m.uid !== project.owner_uid && (
                        <button onClick={() => handleRemoveMember(m.uid)} className="p-1.5 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Remove">
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => m.email ? window.open(`mailto:${m.email}`, '_blank') : alert('No email provided by this user.')}
                        className="p-1.5 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Send Email"
                      >
                        <Mail size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {(!project.members_info || project.members_info.length === 0) && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center">
                    <Users size={20} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400 font-semibold">No team members yet</p>
                  <p className="text-xs text-slate-600 mt-1">Be the first to join this project!</p>
                </div>
              )}
            </div>

            {/* Join / Leave action — full-width bottom bar */}
            {user && project.owner_uid !== user.uid && (
              <div className="px-5 pb-5">
                <button
                  onClick={handleJoin}
                  className={`w-full font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm ${isMember
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                      : isRequested
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                        : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-500/10'
                    }`}
                >
                  {isMember
                    ? <><Trash2 size={14} /> Leave Team</>
                    : isRequested
                      ? 'Request Pending (Click to Cancel)'
                      : <><Sparkles size={14} /> Request to Join</>
                  }
                </button>
              </div>
            )}
            {!user && (
              <div className="px-5 pb-5">
                <button onClick={login} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 text-sm">
                  <Sparkles size={14} /> Sign in to Join
                </button>
              </div>
            )}
          </div>


          {/* Pending Applications - ONLY VISIBLE TO LEADER */}
          {user && project.owner_uid === user.uid && project.join_requests_info?.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>

              <h4 className="text-sm font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                Pending Applications ({project.join_requests_info.length})
              </h4>

              <div className="space-y-4 relative z-10">
                {project.join_requests_info.map((req) => (
                  <div key={req.uid} className="bg-black/40 border border-white/5 rounded-xl p-4 transition-all hover:border-yellow-500/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        {req.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white leading-none mb-1">{req.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{req.branch || 'University Student'}</p>
                      </div>
                      {req.github && (
                        <button onClick={() => openGithubIntel(req)} className="text-emerald-500/40 hover:text-emerald-400 transition-colors ml-auto" title="GitHub Intel">
                          <Github size={14} />
                        </button>
                      )}
                    </div>

                    {req.skills && req.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {req.skills.slice(0, 3).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-white/5 text-[10px] text-slate-400 rounded-md border border-white/5">{s}</span>
                        ))}
                        {req.skills.length > 3 && <span className="text-[10px] text-slate-500 pl-1">+{req.skills.length - 3}</span>}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(req.uid)} className="flex-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-xs font-bold py-2 rounded-lg border border-teal-500/20 transition-colors">
                        Accept
                      </button>
                      <button onClick={() => handleReject(req.uid)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-2 rounded-lg border border-red-500/20 transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills Card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Stack Requirements</h4>
            <div className="flex flex-wrap gap-2">
              {project.required_skills?.map(skill => (
                <span key={skill} className="px-3 py-1 rounded-lg bg-black/40 text-slate-300 text-xs font-semibold border border-white/5 group hover:border-teal-500/50 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Intel Modal */}
      <AnimatePresence>
        {intelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setIntelModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <BarChart3 size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">GitHub Intel</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{intelModal.name}</p>
                  </div>
                </div>
                <button onClick={() => setIntelModal(null)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 max-h-[70vh] overflow-y-auto">
                {intelLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500">Fetching GitHub data...</p>
                  </div>
                ) : intelData?.error ? (
                  <div className="text-center py-8">
                    <p className="text-red-400 text-sm">⚠ {intelData.error}</p>
                  </div>
                ) : intelData ? (
                  <div className="space-y-5">
                    {/* Profile Card */}
                    <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
                      <img src={intelData.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-emerald-500/30" />
                      <div className="flex-1">
                        <a href={intelData.profileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                          @{intelData.login} <ExternalLink size={10} />
                        </a>
                        {intelData.bio && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{intelData.bio}</p>}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Repos', value: intelData.publicRepos, icon: BookOpen, color: 'text-indigo-400' },
                        { label: 'Stars', value: intelData.totalStars, icon: Star, color: 'text-yellow-400' },
                        { label: 'Followers', value: intelData.followers, icon: Users, color: 'text-teal-400' },
                        { label: 'Following', value: intelData.following, icon: Users, color: 'text-slate-400' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-black/40 rounded-xl p-3 text-center border border-white/5">
                          <stat.icon size={14} className={`${stat.color} mx-auto mb-1.5`} />
                          <p className="text-lg font-black text-white">{stat.value || 0}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Top Languages */}
                    {intelData.topLangs?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Code size={12} /> Top Languages
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {intelData.topLangs.map(([lang, count]) => (
                            <span key={lang} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                              {lang}
                              <span className="text-emerald-500/50 text-[9px]">{count} repos</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Repos */}
                    {intelData.topRepos?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <BookOpen size={12} /> Notable Projects
                        </h4>
                        <div className="space-y-2">
                          {intelData.topRepos.map(repo => (
                            <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-black/30 border border-white/5 rounded-lg hover:border-emerald-500/30 transition-all group">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{repo.name}</span>
                                <div className="flex items-center gap-1 text-yellow-500 text-[10px]">
                                  <Star size={10} /> {repo.stargazers_count}
                                </div>
                              </div>
                              {repo.description && <p className="text-[10px] text-slate-500 mt-1 truncate">{repo.description}</p>}
                              <div className="flex items-center gap-2 mt-1.5">
                                {repo.language && <span className="text-[9px] text-emerald-400/60 font-semibold">{repo.language}</span>}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
