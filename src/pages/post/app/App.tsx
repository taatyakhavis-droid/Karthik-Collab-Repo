import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { authService } from '../../../services/authService';
import { Post } from '../../../types/post';

export default function App() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (id) {
      const data = postService.getPostById(id);
      if (data) setPost(data);
    }
    setCategories(postService.getCategories());
    authService.isAdmin().then(res => setIsAdmin(res));
    window.scrollTo(0, 0);
  }, [id]);

  const handleLogout = async () => {
    await authService.logout();
    setIsAdmin(false);
    setIsMenuOpen(false);
  };

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden">
      <header className="fixed top-0 flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setIsMenuOpen(true)}
            className="group flex flex-col gap-1.5 cursor-pointer p-2 hover:scale-110 transition-transform"
          >
            <div className="w-8 h-0.5 bg-[#FBDE06] group-hover:w-6 transition-all"></div>
            <div className="w-6 h-0.5 bg-[#FBDE06] group-hover:w-8 transition-all"></div>
            <div className="w-4 h-0.5 bg-[#FBDE06] group-hover:w-8 transition-all"></div>
          </div>
          <Link to="/">
            <h1 className="font-archivo tracking-[-0.02em] uppercase text-[#FBDE06]" style={{ fontSize: '24px' }}>THE ARCHIVE</h1>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-400 font-bold hover:text-[#FBDE06] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined font-bold" style={{ fontSize: '18px' }}>arrow_back</span>
            Back
          </Link>
        </div>
      </header>

      {/* Modern Navigation Drawer */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible'}`}
      >
        <div 
          className={`absolute inset-0 bg-[#0e0e0e]/40 backdrop-blur-xl transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div 
          className={`absolute top-0 left-0 h-full w-full md:w-[480px] bg-[#1a1a1a] shadow-[20px_0_100px_rgba(0,0,0,0.8)] p-12 flex flex-col transition-transform duration-700 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-archivo text-[#FBDE06] text-2xl uppercase">Reader Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center text-[#FBDE06] hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-12">
            <section>
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 block">Switch Vibe</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <Link 
                    key={cat}
                    to="/"
                    className="px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-left text-gray-400 neumorphic-flat hover:text-[#FBDE06]"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </section>

            <nav className="flex flex-col gap-6">
              <Link to="/" className="text-4xl font-archivo text-white hover:text-[#FBDE06] transition-colors duration-300">HOME</Link>
              <a href="#" className="text-4xl font-archivo text-white hover:text-[#FBDE06] transition-colors duration-300">EXPLORE</a>

              {/* Ghost Admin Elevation */}
              {isAdmin && (
                <div className="pt-6 mt-6 border-t border-[#262626] flex flex-col gap-6">
                  <Link onClick={() => setIsMenuOpen(false)} to="/admin" className="text-4xl font-archivo text-[#FBDE06] hover:scale-105 transition-transform flex items-center gap-4">
                    ADMIN
                    <span className="material-symbols-outlined text-sm">settings</span>
                  </Link>
                  <button onClick={handleLogout} className="text-left text-4xl font-archivo text-red-500 hover:text-red-400 transition-colors">
                    LOGOUT
                  </button>
                </div>
              )}
            </nav>
          </div>

          <div className="pt-12 border-t border-[#262626] flex items-center justify-between">
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-[#FBDE06] transition-colors">
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#FBDE06] transition-colors">
                 <i className="fa-brands fa-x-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#FBDE06] transition-colors">
                 <span className="material-symbols-outlined text-xl">share</span>
              </a>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-800">Archive Reader v2.0</span>
          </div>
        </div>
      </div>

      <main className="pt-24 pb-20 max-w-5xl mx-auto px-6">
        <div className="mb-12 rounded-[2.5rem] overflow-hidden neumorphic-flat shadow-2xl">
          <img 
            src={post.image} 
            className="w-full aspect-[21/9] object-cover grayscale hover:grayscale-0 transition-all duration-500"
            style={{ objectPosition: post.imagePosition || 'center' }}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span className="bg-[#FBDE06] text-[#0e0e0e] px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-tighter">
              {post.category}
            </span>
            <span className="text-[#adaaaa] font-bold tracking-widest uppercase text-[12px]">{post.date}</span>
          </div>
          
          <h1 className="font-archivo text-white leading-none tracking-tighter mb-8" style={{ fontSize: 'clamp(40px, 8vw, 88px)' }}>
            {post.title}
          </h1>

          <div className="prose prose-invert max-w-none editor-content text-[#adaaaa] leading-relaxed text-lg" 
               dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </main>
    </div>
  );
}