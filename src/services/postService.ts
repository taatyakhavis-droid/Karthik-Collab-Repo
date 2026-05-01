import { Post } from '../types/post';

const STORAGE_KEY = 'mostly_india_posts';
const CATEGORY_KEY = 'mostly_india_categories';

const DEFAULT_CATEGORIES = [
  'Digital Theory',
  'Brutalist Architecture',
  'Kinetic Motion',
  'Art & Culture'
];

// Initial seed data to make the app look alive immediately
const SEED_DATA: Post[] = [
  {
    id: '1',
    title: 'THE FUTURE OF ANALOG SYSTEMS',
    category: 'Technology',
    content: '<p>Exploring why tactile interfaces are making a massive comeback in a hyper-digital world. Neumorphism, often criticized as an aesthetic gimmick, represents a deeper psychological need for tactile reassurance.</p>',
    image: 'https://images.unsplash.com/photo-1770515853604-4487b6370bc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    date: 'OCT 24, 2025',
    status: 'public',
    author: { name: 'Erik Vildsten', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100' },
    readTime: '8 min read',
    tags: ['Brutalism', 'Design Systems', 'Tactile UI']
  },
  {
    id: '2',
    title: 'DECODING NEUMORPHIC DEPTH',
    category: 'Design',
    content: 'How light and shadow create the illusion of physicality on flat screens.',
    image: 'https://images.unsplash.com/photo-1648049941490-b22f4d35fb45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    date: 'OCT 21, 2025',
    status: 'public',
    author: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100' },
    readTime: '5 min read',
    tags: ['UI/UX', 'Shadows', 'Depth']
  }
];

export const postService = {
  // --- Category Methods ---
  getCategories: (): string[] => {
    try {
      const stored = localStorage.getItem(CATEGORY_KEY);
      if (!stored) {
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
    } catch (e) {
      console.error('Failed to parse categories:', e);
      return DEFAULT_CATEGORIES;
    }
  },

  addCategory: (name: string): string[] => {
    const categories = postService.getCategories();
    if (name && !categories.includes(name)) {
      categories.push(name);
      localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    }
    return categories;
  },

  deleteCategory: (name: string): string[] => {
    const categories = postService.getCategories().filter(c => c !== name);
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    return categories;
  },

  getPosts: (): Post[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
        return SEED_DATA;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : SEED_DATA;
    } catch (e) {
      console.error('Failed to parse posts:', e);
      return SEED_DATA;
    }
  },

  getPostById: (id: string): Post | undefined => {
    const posts = postService.getPosts();
    return posts.find(p => p.id === id);
  },

  savePost: (post: Partial<Post>): Post => {
    const posts = postService.getPosts();
    const newPost: Post = {
      id: post.id || Math.random().toString(36).substr(2, 9),
      title: post.title || 'Untitled Post',
      category: post.category || 'Uncategorized',
      content: post.content || '',
      image: post.image || 'https://images.unsplash.com/photo-1518005020951-eccb494ad742',
      imagePosition: post.imagePosition || '50% 50%',
      date: post.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
      status: post.status || 'draft',
      author: post.author || { name: 'Admin', avatar: '' },
      readTime: post.readTime || '3 min read',
      tags: post.tags || []
    };

    const existingIndex = posts.findIndex(p => p.id === newPost.id);
    if (existingIndex > -1) {
      posts[existingIndex] = newPost;
    } else {
      posts.unshift(newPost);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return newPost;
  },

  deletePost: (id: string): void => {
    const posts = postService.getPosts();
    const filtered = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  updatePostStatus: (id: string, status: 'public' | 'draft' | 'archived'): void => {
    const posts = postService.getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index > -1) {
      posts[index].status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }
  }
};
