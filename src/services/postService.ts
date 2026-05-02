import { supabase } from '../lib/supabase';
import { Post } from '../types/post';

function calculateReadTime(content: string): string {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
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
    const now = new Date().toISOString();
    const readTime = calculateReadTime(post.content || '');
    const toSave = {
      title: post.title,
      slug: post.slug,
      short_description: post.short_description || '',
      content: post.content || '',
      cover_image: post.cover_image || '',
      image_position: post.image_position || '50% 50%',
      category: post.category || 'Uncategorized',
      status: post.status || 'draft',
      read_time: readTime,
      tags: post.tags || [],
      author_name: post.author_name || 'Admin',
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
    const { error } = await supabase.from('categories').insert({ name });
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
    const { error } = await supabase.from('tags').insert({ name });
    if (error) throw error;
  },

  deleteTag: async (name: string): Promise<void> => {
    const { error } = await supabase.from('tags').delete().eq('name', name);
    if (error) throw error;
  },
};
