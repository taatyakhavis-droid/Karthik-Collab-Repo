export interface Author {
  name: string;
  avatar: string;
}

export interface Post {
  id: string;
  title: string;
  category: string;
  content: string;
  image: string;
  date: string;
  status: 'draft' | 'public';
  author: Author;
  readTime: string;
  imagePosition?: string;
  tags?: string[];
}
