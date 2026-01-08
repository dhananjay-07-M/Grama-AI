
export type AppView = 'home' | 'assistant' | 'weather' | 'crop-doctor' | 'market' | 'schemes' | 'settings' | 'jobs';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  language: Language;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Daily Wage';
  description: string;
}

export type Language = 'en' | 'hi' | 'te' | 'mr' | 'pa' | 'kn' | 'ta' | 'bn' | 'gu' | 'ml';

export interface UserProfile {
  isRegistered: boolean;
  isAuthenticated: boolean;
  name: string;
  phone: string;
  email: string;
  currentCrop?: string;
  location?: string;
  preferences: {
    hourlySms: boolean;
    schemeCalls: boolean;
    jobAlerts: boolean;
    emailReports: boolean;
  }
}

export interface Scheme {
  id: string;
  title: string;
  description: string;
  type: 'Central' | 'State';
  benefit: string;
  eligibility: string;
  link: string;
}

export interface AppState {
  language: Language;
  location: { lat: number; lng: number } | null;
}
