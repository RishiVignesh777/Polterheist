export interface GDScriptDoc {
  id: string;
  filename: string;
  title: string;
  nodeType: string;
  description: string;
  code: string;
  nodeTree: string[];
  setupNotes: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export interface GeneratedAsset {
  id: string;
  prompt: string;
  imageUrl: string;
  modelUsed: string;
  imageSize: '1K' | '2K' | '4K';
  aspectRatio: string;
  createdAt: number;
}
