import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { Post } from '../../../types/post';

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="bg-[#20201f] p-4 rounded-[2rem] neumorphic-flat">
        <div className="rounded-2xl overflow-hidden mb-6 bg-[#1a1a1a] aspect-[4/3]" />
        <div className="px-2 pb-4 space-y-3">
          <div className="h-3 bg-[#1a1a1a] rounded w-24" />
          <div className="h-5 bg-[#1a1a1a] rounded w-3/4" />
          <div className="h-4 bg-[#1a1a1a] rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      postService.getPosts(),
      postService.getCategories(),
      postService.getTags(),
    ]).then(([p, c, t]) => {
      setPosts(p);
      setCategories(c);
      setTags(t);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter(p => {
    if (selectedCategory) return p.category === selectedCategory;
    if (selectedTag) return p.tags?.includes(selectedTag);
    return true;
  });

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  const selectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedTag(null);
    setIsMenuOpen(false);
  };

  const selectTag = (tag: string) => {
    setSelectedTag(tag);
    setSelectedCategory(null);
    setIsMenuOpen(false);
  };

  const clearFilter = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const activeFilter = selectedCategory || selectedTag;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden">
      <div className="fixed top-0 left-0 w-1/3 h-1 bg-[#FBDE06] z-[60]" />

      {/* ── Header ── */}
      <header className="fixed top-0 flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <button
            aria-label="Open navigation menu"
            onClick={() => setIsMenuOpen(true)}
            className="group flex flex-col gap-1.5 cursor-pointer p-2 hover:scale-110 transition-transform"
          >
            <div className="w-8 h-0.5 bg-[#FBDE06] group-hover:w-6 transition-all" />
            <div className="w-6 h-0.5 bg-[#FBDE06] group-hover:w-8 transition-all" />
            <div className="w-4 h-0.5 bg-[#FBDE06] group-hover:w-8 transition-all" />
          </button>
          <Link to="/" onClick={clearFilter}>
            <h1 className="font-archivo tracking-[-0.02em] uppercase text-[#FBDE06]" style={{ fontSize: '24px' }}>
              THE ARCHIVE
            </h1>
          </Link>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link
            className="font-archivo tracking-tighter uppercase text-xs text-gray-400 hover:text-[#FBDE06] transition-colors"
            to="/" onClick={clearFilter}
          >
            Home
          </Link>
        </nav>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto">
        {/* Active filter pill */}
        {activeFilter && (
          <div className="mb-8 flex flex-wrap gap-2 animate-in slide-in-from-left duration-700">
            <button
              onClick={clearFilter}
              className="bg-[#FBDE06] text-[#0e0e0e] px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-tighter flex items-center gap-2"
            >
              {activeFilter}
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            </button>
          </div>
        )}

        {loading ? (
          <>
            <div className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
              <div className="lg:col-span-7 rounded-3xl bg-[#1a1a1a] min-h-[300px]" />
              <div className="lg:col-span-5 space-y-4">
                <div className="h-3 bg-[#1a1a1a] rounded w-32" />
                <div className="h-14 bg-[#1a1a1a] rounded w-full" />
                <div className="h-4 bg-[#1a1a1a] rounded w-full" />
                <div className="h-4 bg-[#1a1a1a] rounded w-3/4" />
              </div>
            </div>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </section>
          </>
        ) : featuredPost ? (
          <>
            {/* Featured post */}
            <section className="mb-20 relative">
              <div className="absolute -top-10 -left-4 font-archivo opacity-[0.03] pointer-events-none select-none tracking-[-0.04em] text-white" style={{ fontSize: 'clamp(80px, 12vw, 192px)' }}>
                {activeFilter ? 'FILTERED' : 'RECENT'}
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 rounded-3xl overflow-hidden neumorphic-flat h-full min-h-[300px]">
                  <img
                    alt={featuredPost.title}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    src={featuredPost.cover_image}
                    style={{ objectPosition: featuredPost.image_position }}
                  />
                </div>
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <span className="text-[#FBDE06] font-bold tracking-[0.2em] uppercase text-[10px]">
                    {activeFilter ? activeFilter : 'Featured Story'}
                  </span>
                  <h2 className="font-archivo tracking-[-0.04em] leading-[0.9] text-white" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
                    {featuredPost.title}
                  </h2>
                  <p className="text-[#adaaaa] line-clamp-3 text-lg">{featuredPost.short_description}</p>
                  {featuredPost.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {featuredPost.tags.map(tag => (
                        <span key={tag} className="text-[#FBDE06]/60 text-[10px] font-bold uppercase tracking-widest border border-[#FBDE06]/20 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4">
                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      className="bg-[#20201f] text-[#FBDE06] px-8 py-4 rounded-xl neumorphic-flat active:shadow-[inset_4px_4px_8px_#0a0a0a,inset_-4px_-4px_8px_#1a1a1a] transition-all font-bold uppercase tracking-widest inline-flex items-center gap-2 text-xs"
                    >
                      Read Archive <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Post grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {otherPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="flex flex-col gap-6">
                  <div className="bg-[#20201f] p-4 rounded-[2rem] neumorphic-flat group cursor-pointer transition-all hover:-translate-y-2">
                    <div className="rounded-2xl overflow-hidden mb-6 relative">
                      <img
                        alt={post.title}
                        className="w-full aspect-[4/3] object-cover scale-105 group-hover:scale-100 grayscale group-hover:grayscale-0 transition-all duration-500"
                        src={post.cover_image}
                        style={{ objectPosition: post.image_position }}
                      />
                      <div className="absolute top-4 left-4 bg-[#FBDE06] text-[#0e0e0e] font-black px-3 py-1 rounded-full uppercase tracking-tighter text-[10px]">
                        {post.category}
                      </div>
                    </div>
                    <div className="px-2 pb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[#adaaaa] font-bold tracking-widest uppercase text-xs">
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </span>
                        <span className="text-[#adaaaa] text-[10px]">{post.read_time}</span>
                      </div>
                      <h3 className="font-archivo leading-tight group-hover:text-[#FBDE06] transition-colors tracking-tight text-xl mb-2">
                        {post.title}
                      </h3>
                      <p className="text-[#adaaaa] text-sm line-clamp-2">{post.short_description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="font-archivo text-gray-800 text-4xl uppercase">No records found</h2>
            {activeFilter && (
              <button onClick={clearFilter} className="text-[#FBDE06] mt-4 uppercase font-bold tracking-widest text-xs">
                Clear Filter
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Navigation Drawer ── */}
      <div className={`fixed inset-0 z-[100] transition-all duration-700 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-[#0e0e0e]/40 backdrop-blur-xl transition-opacity duration-700 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div className={`absolute top-0 left-0 h-full w-full md:w-[480px] bg-[#1a1a1a] shadow-[20px_0_100px_rgba(0,0,0,0.8)] p-12 flex flex-col transition-transform duration-700 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-archivo text-[#FBDE06] text-2xl">EXPLORE</h2>
            <button
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              className="w-12 h-12 rounded-full neumorphic-inset flex items-center justify-center text-[#FBDE06] hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-10">
            {/* Category filter */}
            {categories.length > 0 && (
              <section>
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-4 block">
                  Filter by Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => selectCategory(cat)}
                      className={`px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all text-left ${selectedCategory === cat ? 'bg-[#FBDE06] text-[#0e0e0e] shadow-xl' : 'text-gray-400 neumorphic-flat hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Tag filter */}
            {tags.length > 0 && (
              <section>
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-4 block">
                  Filter by Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => selectTag(tag)}
                      className={`px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${selectedTag === tag ? 'bg-[#FBDE06] text-[#0e0e0e]' : 'text-gray-400 neumorphic-flat hover:text-white'}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Nav links — no admin links exposed */}
            <nav className="flex flex-col gap-6 pt-4">
              <Link
                onClick={() => { setIsMenuOpen(false); clearFilter(); }}
                to="/"
                className="text-4xl font-archivo text-white hover:text-[#FBDE06] transition-colors duration-300"
              >
                HOME
              </Link>
            </nav>
          </div>

          <div className="pt-12 border-t border-[#262626] flex items-center justify-between">
            <div className="flex gap-6">
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-[#FBDE06] transition-colors">
                <i className="fa-brands fa-instagram text-xl" />
              </a>
              <a href="#" aria-label="Twitter / X" className="text-gray-500 hover:text-[#FBDE06] transition-colors">
                <i className="fa-brands fa-x-twitter text-xl" />
              </a>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-800">MostlyIndia</span>
          </div>
        </div>
      </div>
    </div>
  );
}