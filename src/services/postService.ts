import DOMPurify from 'dompurify';
import { supabase } from '../lib/supabase';
import { Post } from '../types/post';

// ─── Allowed HTML tags/attributes in blog body ───────────────────────────────
const PURIFY_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'div', 'span',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'class', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true,
  // Prevent javascript: URIs in href/src
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
}

// ─── Validation helpers ───────────────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateSlug(slug: string): void {
  if (!slug || slug.length < 2) throw new Error('Slug must be at least 2 characters.');
  if (slug.length > 120) throw new Error('Slug must be 120 characters or less.');
  if (!SLUG_RE.test(slug)) throw new Error('Slug may only contain lowercase letters, numbers, and hyphens.');
}

function validateName(name: string, label: string): string {
  const trimmed = name.trim().slice(0, 60);
  if (!trimmed) throw new Error(`${label} name cannot be empty.`);
  return trimmed;
}

function calculateReadTime(content: string): string {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// ─── Safe image src guard ─────────────────────────────────────────────────────
export function safeSrc(src: string): string {
  if (!src) return '';
  if (/^(https?:\/\/|data:image\/)/i.test(src)) return src;
  return ''; // reject javascript: and other schemes
}

export const postService = {
  // ─── PUBLIC ────────────────────────────────────────────────
  getPosts: async (): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'public')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Post[];
  },

  getPostBySlug: async (slug: string): Promise<Post | null> => {
    // Validate slug format to prevent injection/traversal
    if (!SLUG_RE.test(slug)) return null;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'public')
      .single();
    if (error) return null;
    return data as Post;
  },

  // Admin fetch — returns drafts too (protected by RLS: auth required)
  getAdminPostBySlug: async (slug: string): Promise<Post | null> => {
    if (!SLUG_RE.test(slug)) return null;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data as Post;
  },

  // ─── ADMIN ─────────────────────────────────────────────────
  getAllPosts: async (): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Post[];
  },

  savePost: async (post: Partial<Post> & { slug: string; title: string }): Promise<Post> => {
    // Validate & sanitize before touching the DB
    validateSlug(post.slug);
    if (!post.title?.trim()) throw new Error('Title is required.');
    if (post.title.length > 200) throw new Error('Title must be 200 characters or less.');

    const cleanContent = sanitizeHtml(post.content || '');
    const now = new Date().toISOString();
    const readTime = calculateReadTime(cleanContent);

    const toSave = {
      title: post.title.trim().slice(0, 200),
      slug: post.slug,
      short_description: (post.short_description || '').trim().slice(0, 160),
      content: cleanContent,
      cover_image: safeSrc(post.cover_image || ''),
      image_position: post.image_position || '50% 50%',
      category: (post.category || 'Uncategorized').trim().slice(0, 60),
      status: post.status || 'draft',
      read_time: readTime,
      tags: (post.tags || []).map(t => t.trim().slice(0, 40)).filter(Boolean).slice(0, 20),
      author_name: 'Admin',
      updated_at: now,
      published_at: post.status === 'public' ? (post.published_at || now) : null,
    };

    if (post.id) {
      const { data, error } = await supabase
        .from('posts')
        .update(toSave)
        .eq('id', post.id)
        .select()
        .single();
      if (error) throw error;
      return data as Post;
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert({ ...toSave, created_at: now })
        .select()
        .single();
      if (error) throw error;
      return data as Post;
    }
  },

  deletePost: async (id: string): Promise<void> => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
  },

  // ─── CATEGORIES ────────────────────────────────────────────
  getCategories: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name');
    if (error) throw error;
    return (data || []).map((c: { name: string }) => c.name);
  },

  addCategory: async (name: string): Promise<void> => {
    const clean = validateName(name, 'Category');
    const { error } = await supabase.from('categories').insert({ name: clean });
    if (error) throw error;
  },

  deleteCategory: async (name: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('name', name);
    if (error) throw error;
  },

  // ─── TAGS ──────────────────────────────────────────────────
  getTags: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('tags')
      .select('name')
      .order('name');
    if (error) throw error;
    return (data || []).map((t: { name: string }) => t.name);
  },

  addTag: async (name: string): Promise<void> => {
    const clean = validateName(name, 'Tag');
    const { error } = await supabase.from('tags').insert({ name: clean });
    if (error) throw error;
  },

  deleteTag: async (name: string): Promise<void> => {
    const { error } = await supabase.from('tags').delete().eq('name', name);
    if (error) throw error;
  },
};
