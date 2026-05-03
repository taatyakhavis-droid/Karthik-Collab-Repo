import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { authService } from '../../../services/authService';
import { Post } from '../../../types/post';

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const all = await postService.getAllPosts();
      setPosts(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [refreshKey]);

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Permanently delete "${post.title}"?`)) return;
    try {
      await postService.deletePost(post.id);
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  };

  const published = posts.filter(p => p.status === 'public').length;
  const drafts = posts.filter(p => p.status === 'draft').length;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* Header */}
      <header className="fixed top-0 flex justify-between items-center w-full px-4 sm:px-6 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <Link to="/console" onClick={() => setRefreshKey(k => k + 1)}>
            <h1 className="font-archivo tracking-[-0.02em] uppercase text-[#FBDE06] text-xl sm:text-2xl">THE ARCHIVE</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden md:flex gap-6 items-center">
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-gray-400 font-bold hover:text-[#FBDE06] transition-colors text-xs uppercase tracking-widest">Live Site</a>
            <Link to="/console/categories" className="text-gray-400 font-bold hover:text-[#FBDE06] transition-colors text-xs uppercase tracking-widest">Categories</Link>
            <button onClick={() => authService.logout()} className="text-gray-400 font-bold hover:text-red-500 transition-colors text-xs uppercase tracking-widest">Logout</button>
          </nav>
          <Link to="/console/new" className="bg-[#FBDE06] text-[#0e0e0e] px-4 sm:px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span> 
            <span className="hidden sm:inline">New Post</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 sm:pt-28 pb-32 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="font-archivo tracking-tighter uppercase leading-none" style={{ fontSize: 'clamp(32px, 6vw, 64px)' }}>
            ADMIN <span className="text-[#FBDE06]">CONSOLE</span>
          </h2>
          <p className="text-[#adaaaa] text-[10px] sm:text-xs uppercase tracking-widest mt-2">Editorial Management System</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Posts', value: posts.length, color: 'text-white' },
            { label: 'Published', value: published, color: 'text-[#FBDE06]' },
            { label: 'Drafts', value: drafts, color: 'text-[#adaaaa]' },
          ].map(stat => (
            <div key={stat.label} className="neumorphic-flat rounded-2xl p-4 sm:p-6 flex flex-row sm:flex-col items-center sm:justify-center gap-4 sm:gap-1">
              <span className={`font-archivo text-3xl sm:text-4xl font-black ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Post List */}
        <section className="neumorphic-flat rounded-3xl sm:rounded-[2rem] overflow-hidden">
          <div className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-[#262626]">
            <h3 className="font-archivo uppercase tracking-tight text-base sm:text-lg">All Posts</h3>
            <Link to="/console/new" className="text-[#FBDE06] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">add</span> New
            </Link>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#FBDE06] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-xs uppercase tracking-widest">No posts yet.</p>
              <Link to="/console/new" className="text-[#FBDE06] mt-4 inline-block text-xs font-bold uppercase tracking-widest">Create your first post →</Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {posts.map(post => (
                <div key={post.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 sm:px-8 py-5 hover:bg-[#1a1a1a] transition-colors group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-[#262626] neumorphic-inset">
                      {post.cover_image && <img src={post.cover_image} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white truncate text-sm sm:text-base">{post.title}</p>
                        <span className={`sm:hidden px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 ${post.status === 'public' ? 'bg-[#FBDE06] text-[#0e0e0e]' : 'bg-[#262626] text-[#adaaaa]'}`}>
                          {post.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[#adaaaa] text-[9px] uppercase tracking-widest font-bold">{post.category}</span>
                        <span className="text-[#444] text-[9px] hidden sm:inline">•</span>
                        <span className="text-gray-500 text-[9px]">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="hidden sm:block shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${post.status === 'public' ? 'bg-[#FBDE06] text-[#0e0e0e]' : 'bg-[#262626] text-[#adaaaa]'}`}>
                        {post.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-[#1a1a1a] sm:border-0">
                    <div className="flex sm:hidden gap-2">
                      {post.tags?.slice(0, 2).map(t => (
                        <span key={t} className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">#{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/console/edit/${post.slug}`} className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl sm:rounded-lg neumorphic-flat flex items-center justify-center text-gray-500 hover:text-[#FBDE06] transition-colors">
                        <span className="material-symbols-outlined text-sm sm:text-base">edit</span>
                      </Link>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl sm:rounded-lg neumorphic-flat flex items-center justify-center text-gray-500 hover:text-[#FBDE06] transition-colors">
                        <span className="material-symbols-outlined text-sm sm:text-base">open_in_new</span>
                      </a>
                      <button onClick={() => handleDelete(post)} className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl sm:rounded-lg neumorphic-flat flex items-center justify-center text-gray-500 hover:text-[#ff7351] transition-colors">
                        <span className="material-symbols-outlined text-sm sm:text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-around items-center max-w-md mx-auto bg-[#20201f]/60 backdrop-blur-2xl rounded-[2rem] px-8 py-3 shadow-[5px_5px_10px_#0a0a0a,-5px_-5px_10px_#1a1a1a] w-[90%]">
          <a href="/" className="text-gray-500 p-3"><span className="material-symbols-outlined">home</span></a>
          <Link to="/console/new" className="text-gray-500 p-3"><span className="material-symbols-outlined">add_circle</span></Link>
          <Link to="/console/categories" className="text-gray-500 p-3"><span className="material-symbols-outlined">label</span></Link>
          <button onClick={() => authService.logout()} className="text-gray-500 p-3"><span className="material-symbols-outlined">logout</span></button>
        </nav>
      </main>
    </div>
  );
}
