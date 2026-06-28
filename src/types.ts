export type BlogCategory = '개발일지' | '일상' | '작품감상평';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: BlogCategory;
  createdAt: number;
  imageUrl?: string;
  tags?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  techStack: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  createdAt: number;
  role: string;
  period: string;
  participants?: string[]; // comma-separated or list of participants
}

export type ActiveTab = 'home' | 'blog' | 'projects' | 'gallery' | 'playlist';
export type Theme = 'light' | 'dark';

export interface Profile {
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
  githubUrl?: string;
  email?: string;
  instagramUrl?: string;
  customUrl?: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  comment: string;
  location?: string;
  createdAt: number;
}

export interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  youtubeUrl: string; // Single video URL or Playlist embed
  comment?: string;
  createdAt: number;
}

export interface Milestone {
  id: string;
  year: string;
  title: string;
  role: string;
  desc: string;
  type: 'work' | 'served' | 'edu';
  createdAt: number;
}

