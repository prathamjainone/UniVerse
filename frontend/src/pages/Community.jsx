import { useState, useEffect, useCallback, useRef } from 'react';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import {
  ChevronUp, ChevronDown, MessageSquare, Send, Trash2,
  TrendingUp, Clock, User, Sparkles, PenLine, Hash, X,
  LogIn, Compass, Rocket, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API_URL from '../api';

/* ── helpers ── */
function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=0D0D0D&color=fff&bold=true`;
}

/* ── components ── */

function VoteButtons({ post, userId, onVote }) {
  const userUpvoted = post.upvoted_by?.includes(userId);
  const userDownvoted = post.downvoted_by?.includes(userId);
  const netVotes = post.upvotes ?? 0;

  return (
    <div className="flex flex-col items-center gap-0.5 mr-4 select-none">
      <button
        onClick={() => onVote(post.id, userUpvoted ? 0 : 1)}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          userUpvoted
            ? 'text-neon-blue bg-neon-blue/15 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
            : 'text-slate-500 hover:text-neon-blue hover:bg-white/5'
        }`}
        title="Upvote"
      >
        <ChevronUp size={20} strokeWidth={2.5} />
      </button>
      <span className={`text-sm font-bold tabular-nums min-w-[20px] text-center ${
        netVotes > 0 ? 'text-neon-blue' : netVotes < 0 ? 'text-neon-magenta' : 'text-slate-400'
      }`}>
        {netVotes}
      </span>
      <button
        onClick={() => onVote(post.id, userDownvoted ? 0 : -1)}
        className={`p-1.5 rounded-lg transition-all duration-200 ${
          userDownvoted
            ? 'text-neon-magenta bg-neon-magenta/15 shadow-[0_0_12px_rgba(255,0,110,0.2)]'
            : 'text-slate-500 hover:text-neon-magenta hover:bg-white/5'
        }`}
        title="Downvote"
      >
        <ChevronDown size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function CommentSection({ post, userId, userName, userPhoto, onAddComment }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);
  const comments = post.comments || [];

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    await onAddComment(post.id, text.trim());
    setText('');
    setSubmitting(false);
  };

  return (
    <div>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={`flex items-center gap-2 text-sm transition-colors ${
          open ? 'text-neon-teal' : 'text-slate-400 hover:text-white'
        }`}
      >
        <MessageSquare size={17} />
        <span>{comments.length}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
              {comments.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-2">No comments yet — start the conversation!</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <img
                    src={c.user_avatar || avatarUrl(c.user_name)}
                    alt=""
                    className="w-7 h-7 rounded-full shrink-0 mt-0.5"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-white">{c.user_name}</span>
                      <span className="text-[10px] text-slate-500">{timeAgo(c.timestamp)}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mt-0.5 break-words">{c.text}</p>
                  </div>
                </div>
              ))}

              {userId && (
                <div className="flex gap-3 items-center pt-2">
                  <img
                    src={userPhoto || avatarUrl(userName)}
                    alt=""
                    className="w-7 h-7 rounded-full shrink-0"
                  />
                  <div className="flex-grow relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Write a comment..."
                      className="w-full bg-white/5 text-sm text-white placeholder-slate-500 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-neon-blue/30 border border-white/5 transition-all"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!text.trim() || submitting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neon-blue disabled:text-slate-600 hover:scale-110 transition-transform"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostCard({ post, userId, userName, userPhoto, onVote, onAddComment, onDelete, index }) {
  const isOwner = userId && post.author_uid === userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="glass rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group"
    >
      <div className="p-5 flex">
        {/* Vote sidebar */}
        <VoteButtons post={post} userId={userId} onVote={onVote} />

        {/* Content */}
        <div className="flex-grow min-w-0">
          {/* Author header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={post.author_avatar || avatarUrl(post.author_name)}
                alt={post.author_name}
                className="w-10 h-10 rounded-full border border-white/10"
              />
              <div>
                <h4 className="font-semibold text-sm text-white leading-tight">{post.author_name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{timeAgo(post.created_at)}</p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => onDelete(post.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-neon-magenta transition-all p-1.5 rounded-lg hover:bg-white/5"
                title="Delete post"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Title */}
          {post.title && (
            <h3 className="font-bold text-base text-white mb-2 leading-snug">{post.title}</h3>
          )}

          {/* Body */}
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words mb-3">{post.content}</p>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-neon-blue/80 bg-neon-blue/[0.08] px-2.5 py-1 rounded-md font-medium"
                >
                  <Hash size={10} />{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-5 pt-3 border-t border-white/5">
            <CommentSection
              post={post}
              userId={userId}
              userName={userName}
              userPhoto={userPhoto}
              onAddComment={onAddComment}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreatePostCard({ user, onPost, login }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    await onPost({ title: title.trim(), content: content.trim(), tags });
    setTitle('');
    setContent('');
    setTags([]);
    setExpanded(false);
    setPosting(false);
  };

  if (!user) {
    return (
      <div className="glass-strong rounded-2xl p-5 border border-white/[0.06] mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <User size={18} className="text-slate-500" />
          </div>
          <button
            onClick={login}
            className="flex-grow text-left text-slate-500 text-sm bg-white/[0.03] rounded-full px-4 py-3 border border-white/5 hover:border-white/10 transition-colors"
          >
            Sign in to share with the community...
          </button>
        </div>
      </div>
    );
  }

  const photo = user.photo_url || avatarUrl(user.display_name);

  return (
    <div className="glass-strong rounded-2xl border border-white/[0.06] mb-6 overflow-hidden">
      <div className="p-5">
        <div className="flex gap-3">
          <img src={photo} alt="" className="w-10 h-10 rounded-full border border-white/10 shrink-0" />
          <div className="flex-grow">
            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-left text-slate-400 text-sm bg-white/[0.03] rounded-full px-4 py-3 border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all"
              >
                <span className="flex items-center gap-2">
                  <PenLine size={14} />
                  Share something with the community...
                </span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title (optional)"
                  className="w-full bg-transparent text-white font-semibold placeholder-slate-500 focus:outline-none text-base"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  autoFocus
                  className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                />

                {/* Tags */}
                <div className="flex flex-wrap gap-2 items-center">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-xs text-neon-blue bg-neon-blue/10 px-2.5 py-1 rounded-md"
                    >
                      #{t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-white">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {tags.length < 5 && (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
                      }}
                      placeholder="Add tag..."
                      className="bg-transparent text-xs text-slate-400 placeholder-slate-600 focus:outline-none w-20"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="flex justify-between items-center px-5 py-3 border-t border-white/5 bg-white/[0.01]">
          <div className="flex gap-2">
            <button className="p-2 text-slate-500 hover:text-white glass rounded-lg transition-colors" title="Add image">
              <ImageIcon size={16} />
            </button>
            <button
              className="p-2 text-slate-500 hover:text-white glass rounded-lg transition-colors"
              title="Add tag"
              onClick={addTag}
            >
              <Hash size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setExpanded(false); setTitle(''); setContent(''); setTags([]); }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || posting}
              className="px-5 py-2 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-semibold rounded-full
                         hover:shadow-[0_0_20px_rgba(112,0,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
            >
              {posting ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </span>
              ) : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main page ── */

export default function Community() {
  const { user, login } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [sortBy, setSortBy] = useState('votes');
  const [error, setError] = useState(null);

  const userId = user?.uid;
  const userName = user?.display_name || 'Guest';
  const userPhoto = user?.photo_url || null;

  /* ── Fetch ── */
  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const url = activeTab === 'my'
        ? `${API_URL}/api/community/user/${userId}`
        : `${API_URL}/api/community/?sort=${sortBy}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load posts. The server might be unavailable.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, sortBy, userId]);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [fetchPosts]);

  /* ── Actions ── */
  const handleVote = async (postId, vote) => {
    if (!userId) return login();
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const up = [...(p.upvoted_by || [])];
        const down = [...(p.downvoted_by || [])];
        if (up.includes(userId)) up.splice(up.indexOf(userId), 1);
        if (down.includes(userId)) down.splice(down.indexOf(userId), 1);
        if (vote === 1) up.push(userId);
        if (vote === -1) down.push(userId);
        return { ...p, upvoted_by: up, downvoted_by: down, upvotes: up.length - down.length };
      })
    );
    try {
      await fetch(`${API_URL}/api/community/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, vote }),
      });
    } catch {
      fetchPosts(); // rollback
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!userId) return login();
    try {
      const res = await fetch(`${API_URL}/api/community/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_name: userName,
          user_avatar: userPhoto,
          text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, comments: [...(p.comments || []), data.comment] } : p
          )
        );
      }
    } catch {
      /* silent */
    }
  };

  const handlePost = async ({ title, content, tags }) => {
    try {
      const res = await fetch(`${API_URL}/api/community/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_uid: userId,
          author_name: userName,
          author_avatar: userPhoto,
          title: title || 'Untitled',
          content,
          tags,
        }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch {
      /* silent */
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await fetch(`${API_URL}/api/community/${postId}`, { method: 'DELETE' });
    } catch {
      fetchPosts();
    }
  };

  const tabs = [
    { key: 'feed', label: 'Feed', icon: Sparkles },
    ...(user ? [{ key: 'my', label: 'My Posts', icon: User }] : []),
  ];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10">

      {/* ─── Left Sidebar ─── */}
      <div className="w-full lg:w-[280px] shrink-0">
        <div className="sticky top-28 flex flex-col gap-5">
          {/* Profile card */}
          <div className="glass-strong rounded-2xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={userPhoto || avatarUrl(userName)}
                alt="Profile"
                className="w-12 h-12 rounded-full border border-white/10"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-base truncate">{userName}</h3>
                <p className="text-slate-400 text-xs truncate">{user?.branch || 'Community Member'}</p>
              </div>
            </div>
            {user ? (
              <Link
                to="/profile"
                className="block w-full py-2.5 glass border border-white/5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors text-center text-slate-300"
              >
                View Profile
              </Link>
            ) : (
              <button
                onClick={login}
                className="w-full py-2.5 glass border border-white/5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-neon-blue"
              >
                <LogIn size={14} /> Sign in to join
              </button>
            )}
          </div>

          {/* Quick links */}
          <div className="glass-strong rounded-2xl p-5 border border-white/[0.06] hidden lg:block">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-200">
              <Sparkles size={14} className="text-neon-purple" /> Quick Links
            </h4>
            <div className="space-y-1">
              <Link
                to="/discover"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Compass size={14} className="text-neon-teal" />Explore Projects
              </Link>
              <Link
                to="/onboarding"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Rocket size={14} className="text-neon-purple" />Create Profile
              </Link>
            </div>
          </div>

          {/* Join CTA */}
          {!user && (
            <div className="glass rounded-2xl p-5 border border-white/[0.06] text-center hidden lg:block">
              <h4 className="font-bold text-sm mb-1.5">Join Uni-Verse</h4>
              <p className="text-[11px] text-slate-400 mb-3">Connect, share, and build with fellow students.</p>
              <button
                onClick={login}
                className="w-full py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-xs font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.3)] transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Feed ─── */}
      <div className="flex-grow min-w-0 max-w-2xl mx-auto lg:mx-0 w-full">
        {/* Post composer */}
        <CreatePostCard user={user} onPost={handlePost} login={login} />

        {/* Tabs + Sort */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'feed' && (
            <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setSortBy('votes')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  sortBy === 'votes'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                <TrendingUp size={12} /> Top
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  sortBy === 'recent'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                <Clock size={12} /> New
              </button>
            </div>
          )}
        </div>

        {/* Posts list */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin mb-4" />
              <p className="text-xs text-slate-500">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-10 border border-white/5 text-center">
              <AlertCircle size={32} className="mx-auto text-neon-magenta/60 mb-3" />
              <p className="text-sm text-slate-400">{error}</p>
              <button
                onClick={fetchPosts}
                className="mt-4 px-5 py-2 text-xs font-medium glass rounded-full border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="glass rounded-2xl p-12 border border-white/5 text-center">
              <div className="text-4xl mb-4">{activeTab === 'my' ? '📝' : '✨'}</div>
              <h3 className="text-base font-bold text-white mb-2">
                {activeTab === 'my' ? 'No posts yet' : 'The feed is empty'}
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                {activeTab === 'my'
                  ? 'Share your first update with the community!'
                  : user
                  ? 'Be the first to share something awesome!'
                  : 'Sign in to post and engage with the community.'}
              </p>
              {!user && (
                <button
                  onClick={login}
                  className="px-6 py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white text-sm font-semibold rounded-full hover:shadow-[0_0_20px_rgba(112,0,255,0.3)] transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  userId={userId}
                  userName={userName}
                  userPhoto={userPhoto}
                  onVote={handleVote}
                  onAddComment={handleAddComment}
                  onDelete={handleDelete}
                  index={i}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ─── Right Sidebar (trending tags / stats) ─── */}
      <div className="w-full lg:w-[260px] shrink-0 hidden lg:block">
        <div className="sticky top-28 space-y-5">
          {/* Trending tags */}
          <div className="glass-strong rounded-2xl p-5 border border-white/[0.06]">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-neon-teal" /> Trending Topics
            </h4>
            <TrendingTags posts={posts} />
          </div>

          {/* Community stats */}
          <div className="glass-strong rounded-2xl p-5 border border-white/[0.06]">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-neon-blue" /> Community Pulse
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Posts</span>
                <span className="text-xs font-bold text-white">{posts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Comments</span>
                <span className="text-xs font-bold text-white">
                  {posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Votes</span>
                <span className="text-xs font-bold text-white">
                  {posts.reduce((sum, p) => sum + Math.abs(p.upvotes || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Trending Tags helper ── */
function TrendingTags({ posts }) {
  const tagCounts = {};
  posts.forEach((p) => {
    (p.tags || []).forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const sorted = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (sorted.length === 0) {
    return <p className="text-xs text-slate-500 italic">No tags yet</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map(([tag, count]) => (
        <div key={tag} className="flex justify-between items-center group">
          <span className="text-xs text-neon-blue/70 group-hover:text-neon-blue transition-colors">
            #{tag}
          </span>
          <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {count} {count === 1 ? 'post' : 'posts'}
          </span>
        </div>
      ))}
    </div>
  );
}
