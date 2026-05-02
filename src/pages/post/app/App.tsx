import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { Post } from '../../../types/post';

export default function App() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    postService.getPostBySlug(slug)
      .then(data => setPost(data))
      .finally(() => {
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
        <p className="text-[#adaaaa] uppercase tracking-widest text-sm">
          This record does not exist in the archive
        </p>
        <Link to="/" className="text-[#FBDE06] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white overflow-x-hidden">
      {/* ── Minimal public header — zero admin references ── */}
      <header className="fixed top-0 flex justify-between items-center w-full px-6 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <Link to="/">
          <h1 className="font-archivo tracking-[-0.02em] uppercase text-[#FBDE06]" style={{ fontSize: '24px' }}>
            THE ARCHIVE
          </h1>
        </Link>
        <Link
          to="/"
          className="text-gray-400 font-bold hover:text-[#FBDE06] transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
        >
          <span className="material-symbols-outlined font-bold" style={{ fontSize: '18px' }}>arrow_back</span>
          Back
        </Link>
      </header>

      <main className="pt-24 pb-20 max-w-5xl mx-auto px-6">
        {/* Cover image — always full color, no grayscale */}
        <div className="mb-12 rounded-[2.5rem] overflow-hidden neumorphic-flat shadow-2xl">
          <img
            src={post.cover_image}
            className="w-full aspect-[21/9] object-cover"
            style={{ objectPosition: post.image_position || 'center' }}
            alt={post.title}
          />
        </div>

        <div className="flex flex-col gap-6">
          {/* Meta row */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="bg-[#FBDE06] text-[#0e0e0e] px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-tighter">
              {post.category}
            </span>
            <span className="text-[#adaaaa] font-bold tracking-widest uppercase text-xs">
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </span>
            <span className="text-[#adaaaa] text-xs">{post.read_time}</span>
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[#FBDE06]/60 text-[10px] font-bold uppercase tracking-widest border border-[#FBDE06]/20 px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="font-archivo text-white leading-none tracking-tighter"
            style={{ fontSize: 'clamp(40px, 8vw, 88px)' }}
          >
            {post.title}
          </h1>

          {/* Short description as lede */}
          {post.short_description && (
            <p className="text-[#adaaaa] text-xl leading-relaxed border-l-4 border-[#FBDE06] pl-6 italic">
              {post.short_description}
            </p>
          )}

          {/* Body */}
          <div
            className="editor-content text-[#adaaaa] leading-relaxed text-lg mt-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>
    </div>
  );
}