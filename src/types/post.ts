export interface Post {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  cover_image: string;
  image_position: string;
  category: string;
  status: 'draft' | 'public';
  read_time: string;
  tags: string[];
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}
