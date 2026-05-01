import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { authService } from '../../../services/authService';
import { Post } from '../../../types/post';
import profileImage from 'figma:asset/522692a0c37e197628cf538dfdaf190599f2dbec.png';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const all = postService.getPosts();
    setPosts(all.filter(p => p.status === 'public'));
    setCategories(postService.getCategories());
    authService.isAdmin().then(res => setIsAdmin(res));
  }, []);

  const filteredPosts = selectedCategory 
    ? posts.filter(p => p.category === selectedCategory)
    : posts;

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  const handleLogout = async () => {
    await authService.logout();
    setIsAdmin(false);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden">
      <div className="fixed top-0 left-0 w-1/3 h-1 bg-[#FBDE06] z-[60]"></div>

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
          <Link to="/" onClick={() => setSelectedCategory(null)}>
            <h1 className="font-archivo tracking-[-0.02em] uppercase text-[#FBDE06]" style={{ fontSize: '24px' }}>THE ARCHIVE</h1>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8">
            <Link className={`font-archivo tracking-tighter uppercase ${!selectedCategory ? 'text-[#FBDE06]' : 'text-gray-400 hover:text-[#FBDE06]'}`} style={{ fontSize: '12px' }} to="/" onClick={() => setSelectedCategory(null)}>Home</Link>
            <a className="text-gray-400 hover:text-[#FBDE06] transition-colors duration-300 font-archivo tracking-tighter uppercase" style={{ fontSize: '12px' }} href="#">Explore</a>
          </nav>
        </div>
      </header>

      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap gap-2 animate-in slide-in-from-left duration-700">
           {selectedCategory && (
             <button 
               onClick={() => setSelectedCategory(null)}
               className="bg-[#FBDE06] text-[#0e0e0e] px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-tighter flex items-center gap-2"
             >
               {selectedCategory} <span className="material-symbols-outlined text-[14px]">close</span>
             </button>
           )}
        </div>

        {featuredPost ? (
          <section className="mb-20 relative">
            <div className="absolute -top-10 -left-4 font-archivo opacity-[0.03] pointer-events-none select-none tracking-[-0.04em] text-white" style={{ fontSize: 'clamp(80px, 12vw, 192px)' }}>
              {selectedCategory ? 'FILTERED' : 'RECENT'}
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 rounded-3xl overflow-hidden neumorphic-flat h-full min-h-[300px]">
                <img alt={featuredPost.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src={featuredPost.image} />
              </div>
              <div className="lg:col-span-5 flex flex-col gap-4">
                <span className="text-[#FBDE06] font-bold tracking-[0.2em] uppercase" style={{ fontSize: '10px' }}>{selectedCategory ? selectedCategory : 'Featured Story'}</span>
                <h2 className="font-archivo tracking-[-0.04em] leading-[0.9] text-white" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
                  {featuredPost.title}
                </h2>
                <p className="text-[#adaaaa] line-clamp-3" style={{ fontSize: '18px' }}>{featuredPost.content.replace(/<[^>]*>/g, '')}</p>
                <div className="mt-4">
                  <Link to={`/post/${featuredPost.id}`} className="bg-[#20201f] text-[#FBDE06] px-8 py-4 rounded-xl neumorphic-flat active:shadow-[inset_4px_4px_8px_#0a0a0a,inset_-4px_-4px_8px_#1a1a1a] transition-all font-bold uppercase tracking-widest inline-flex items-center gap-2" style={{ fontSize: '12px' }}>
                    Read Archive <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="text-center py-20">
             <h2 className="font-archivo text-gray-800 text-4xl uppercase">No records found for this vibe</h2>
             <button onClick={() => setSelectedCategory(null)} className="text-[#FBDE06] mt-4 uppercase font-bold tracking-widest text-xs">Clear Filter</button>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {otherPosts.map(post => (
            <Link key={post.id} to={`/post/${post.id}`} className="flex flex-col gap-6">
              <div className="bg-[#20201f] p-4 rounded-[2rem] neumorphic-flat group cursor-pointer transition-all hover:-translate-y-2">
                <div className="rounded-2xl overflow-hidden mb-6 relative">
                  <img alt={post.title} className="w-full aspect-[4/3] object-cover scale-105 group-hover:scale-100 transition-transform duration-500" src={post.image} />
                  <div className="absolute top-4 left-4 bg-[#FBDE06] text-[#0e0e0e] font-black px-3 py-1 rounded-full uppercase tracking-tighter" style={{ fontSize: '10px' }}>{post.category}</div>
                </div>
                <div className="px-2 pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[#adaaaa] font-bold tracking-widest uppercase" style={{ fontSize: '12px' }}>{post.date}</span>
                  </div>
                  <h3 className="font-archivo leading-tight group-hover:text-[#FBDE06] transition-colors tracking-tight text-xl">{post.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>

      {/* Modern Navigation Drawer */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-[#0e0e0e]/40 backdrop-blur-xl transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Drawer Content */}
        <div 
          className={`absolute top-0 left-0 h-full w-full md:w-[480px] bg-[#1a1a1a] shadow-[20px_0_100px_rgba(0,0,0,0.8)] p-12 flex flex-col transition-transform duration-700 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-archivo text-[#FBDE06] text-2xl">MENU</h2>
            <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center text-[#FBDE06] hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-12">
            <section>
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 block">Filter by Archive</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-left ${selectedCategory === cat ? 'bg-[#FBDE06] text-[#0e0e0e] shadow-xl' : 'text-gray-400 neumorphic-flat hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            <nav className="flex flex-col gap-6">
              <Link onClick={() => setIsMenuOpen(false)} to="/" className="text-4xl font-archivo text-white hover:text-[#FBDE06] transition-colors duration-300">HOME</Link>
              <a onClick={() => setIsMenuOpen(false)} href="#" className="text-4xl font-archivo text-white hover:text-[#FBDE06] transition-colors duration-300">EXPLORE</a>
              
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
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-800">MostlyIndia v2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}