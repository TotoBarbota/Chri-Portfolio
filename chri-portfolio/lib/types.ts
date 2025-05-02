export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  lastModified: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'ppt';
  url: string;
  lastModified: string;
}
