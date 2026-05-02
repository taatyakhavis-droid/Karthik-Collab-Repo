import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { authService } from '../../../services/authService';
import { Post } from '../../../types/post';

export default function App() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      postService.getPostBySlug(slug),
      authService.isAdmin(),
    ]).then(([data, admin]) => {
      setPost(data);
      setIsAdmin(admin);
    }).finally(() => {
      setLoading(false);
      window.scrollTo(0, 0);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FBDE06] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center gap-6">
        <h1 className="font-archivo text-6xl text-gray-800 uppercase">404</h1>
        <p className="text-[#adaaaa] uppercase tracking-widest text-sm">This record does not exist in the archive</p>
        <Link to="/" className="text-[#FBDE06] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden">
      <header className="fixed top-0 flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <div onClick={() => setIsMenuOpen(true)} className="group flex flex-col gap-1.5 cursor-pointer p-2 hover:scale-110 transition-transform">
            <div className="w-8 h-0.5 bg-[#FBDE06] group-hover:w-6 transition-all" />
            <div className="w-6 h-0.5 bg-[#FBDE06] group-hover:w-8 transition-all" />
            <div className="w-4 h-0.5 bg-[#FBDE06] group-hover:w-8 transition-all" />
          </div>
          <Link to="/"><h1 className="font-archivo tracking-[-0.02em] uppercase text-[#FBDE06]" style={{ fontSize: '24px' }}>THE ARCHIVE</h1></Link>
        </div>
        <Link to="/" className="text-gray-400 font-bold hover:text-[#FBDE06] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest">
          <span className="material-symbols-outlined font-bold" style={{ fontSize: '18px' }}>arrow_back</span> Back
        </Link>
      </header>

      {/* Navigation Drawer */}
      <div className={`fixed inset-0 z-[100] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-[#0e0e0e]/40 backdrop-blur-xl transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-0 left-0 h-full w-full md:w-[480px] bg-[#1a1a1a] shadow-[20px_0_100px_rgba(0,0,0,0.8)] p-12 flex flex-col transition-transform duration-700 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-archivo text-[#FBDE06] text-2xl uppercase">Reader Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center text-[#FBDE06] hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            <Link to="/" className="text-4xl font-archivo text-white hover:text-[#FBDE06] transition-colors duration-300">HOME</Link>
            {isAdmin && (
              <div className="pt-6 mt-2 border-t border-[#262626] flex flex-col gap-6">
                <Link to="/admin" className="text-4xl font-archivo text-[#FBDE06] flex items-center gap-4">
                  ADMIN <span className="material-symbols-outlined text-sm">settings</span>
                </Link>
                <Link to={`/admin/edit/${post.slug}`} className="text-2xl font-archivo text-gray-400 hover:text-[#FBDE06] transition-colors flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">edit</span> Edit This Post
                </Link>
              </div>
            )}
          </nav>
          <div className="mt-auto pt-12 border-t border-[#262626]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-800">Archive Reader v2.0</span>
          </div>
        </div>
      </div>

      <main className="pt-24 pb-20 max-w-5xl mx-auto px-6">
        <div className="mb-12 rounded-[2.5rem] overflow-hidden neumorphic-flat shadow-2xl">
          <img src={post.cover_image} className="w-full aspect-[21/9] object-cover grayscale hover:grayscale-0 transition-all duration-500" style={{ objectPosition: post.image_position || 'center' }} alt={post.title} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="bg-[#FBDE06] text-[#0e0e0e] px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-tighter">{post.category}</span>
            <span className="text-[#adaaaa] font-bold tracking-widest uppercase text-xs">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
            <span className="text-[#adaaaa] text-xs">{post.read_time}</span>
          </div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="text-[#FBDE06]/60 text-[10px] font-bold uppercase tracking-widest border border-[#FBDE06]/20 px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          <h1 className="font-archivo text-white leading-none tracking-tighter mb-2" style={{ fontSize: 'clamp(40px, 8vw, 88px)' }}>{post.title}</h1>

          {post.short_description && (
            <p className="text-[#adaaaa] text-xl leading-relaxed border-l-4 border-[#FBDE06] pl-6 italic">{post.short_description}</p>
          )}

          <div className="prose prose-invert max-w-none editor-content text-[#adaaaa] leading-relaxed text-lg mt-4"
            dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </main>
    </div>
  );
}