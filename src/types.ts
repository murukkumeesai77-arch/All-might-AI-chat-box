export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isHeroic?: boolean;
  stickerUrl?: string;
  edited?: boolean;
  rating?: "thumbs_up" | "thumbs_down" | null;
  modelUsed?: string;
  imageUrl?: string;
  attachment?: {
    url: string; // Base64 data URL
    name: string;
    mimeType: string;
    type: "image" | "audio" | "document";
  };
}

export interface Session {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
  customInstructions?: string;
  selectedModel?: "ofa_100" | "ofa_50" | "ofa_120";
}

export interface HeroQuote {
  text: string;
  situation: string;
}
