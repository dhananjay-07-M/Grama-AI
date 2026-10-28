import { UserProfile } from "../types";

// All AI calls go through the /api/ai Netlify Function, which uses Netlify AI Gateway.
// No API keys are needed (or exposed) in the browser.
const callAI = async <T = any>(action: string, payload: Record<string, any>): Promise<T> => {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `AI request failed (${res.status})`);
  return data.result as T;
};

const handleApiError = (error: any, fallback: any, context: string) => {
  console.error(`AI Error (${context}):`, error);
  // Return fallback data so the UI doesn't break
  return fallback;
};

export const getGeminiResponse = async (prompt: string, history: any[] = [], language: string = 'en') => {
  try {
    return await callAI<string>("chat", { prompt, history, language });
  } catch (e) {
    return handleApiError(e,
      "⚠️ **Connection problem**\n\nI couldn't reach the GramAI server just now. Please check your internet connection and try again in a moment.",
      "Chat"
    );
  }
};

// Short, speakable reply for the voice call assistant.
export const getVoiceReply = async (prompt: string, language: string = 'en') => {
  try {
    return await callAI<string>("voiceReply", { prompt, language });
  } catch (e) {
    return handleApiError(e, null, "Voice");
  }
};

export const generateAgriImage = async (prompt: string) => {
  try {
    return await callAI<string | null>("image", { prompt });
  } catch (e) {
    return handleApiError(e, null, "Image Gen");
  }
};

const SPEECH_LOCALES: Record<string, string> = {
  en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN',
  bn: 'bn-IN', gu: 'gu-IN', pa: 'pa-IN', ml: 'ml-IN',
};

export const getSpeechLocale = (language: string) => SPEECH_LOCALES[language] || 'en-IN';

// Speaks text with the browser's built-in speech engine. Resolves when speaking ends.
export const speakText = (text: string, language: string = 'en'): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return resolve();
    const clean = text.replace(/[*#_`>•-]+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 1000);
    const utterance = new SpeechSynthesisUtterance(clean);
    const locale = getSpeechLocale(language);
    utterance.lang = locale;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === locale) || voices.find(v => v.lang.startsWith(language));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
};

// Downscale large photos so they fit in a single function request.
const compressImage = (base64: string, maxSize = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
    };
    img.onerror = () => resolve(base64);
    img.src = `data:image/*;base64,${base64}`;
  });
};

export const analyzeCropImage = async (base64Image: string) => {
  try {
    const image = await compressImage(base64Image);
    return await callAI<string>("analyzeCrop", { image, mimeType: 'image/jpeg' });
  } catch (e) {
    const fallback = JSON.stringify({
      diagnosis: "Analysis unavailable",
      confidence: "Low",
      description: "We couldn't analyze this photo right now. Please check your connection and try again, or contact your local Krishi Vigyan Kendra.",
      solution_steps: ["Retry the analysis in a moment", "Take a clear, close-up photo of the affected leaf", "Consult your local agriculture officer"],
      recommended_medicine: "None",
      medicine_type: ""
    });
    return handleApiError(e, fallback, "Crop Doctor");
  }
};

export interface PlaceResult {
  title: string;
  address: string;
  distance?: string;
  phone?: string;
}

export const getLocationInsights = async (lat: number, lng: number) => {
  try {
    return await callAI("locationInsights", { lat, lng });
  } catch (e) {
    return handleApiError(e, { placeName: "Unknown Region", crops: ["Rice", "Wheat"], outlook: "Service unavailable." }, "Location Insights");
  }
};

export const findNearbyPlaces = async (lat: number, lng: number, type: string): Promise<PlaceResult[]> => {
  try {
    const results = await callAI<PlaceResult[]>("nearbyPlaces", { lat, lng, type });
    if (Array.isArray(results) && results.length > 0) return results;
  } catch (e) {
    handleApiError(e, null, "Find Places");
  }
  return [
    { title: `${type === 'mandi' ? 'APMC Market' : 'Agri Dealer'} (Local)`, address: "Near City Center", distance: "2 km", phone: "N/A" },
    { title: "Kisan Seva Kendra", address: "Main Road", distance: "5 km", phone: "N/A" }
  ];
};

export const getPricePrediction = async (crop: string, location: string) => {
  try {
    return await callAI("pricePrediction", { crop, location });
  } catch (e) {
    return handleApiError(e, { is_crop: false, validation_message: "Service unavailable. Please try again." }, "Price Prediction");
  }
};

export interface AgriJob {
  id: string;
  title: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  phone: string;
}

export const findAgriJobs = async (query: string, location: string): Promise<AgriJob[]> => {
  try {
    return await callAI<AgriJob[]>("jobs", { query, location });
  } catch (e) {
    return handleApiError(e, [], "Find Jobs");
  }
};

export const fetchGovtSchemes = async (language: string, location: string) => {
  try {
    return await callAI("schemes", { language, location });
  } catch (e) {
    return handleApiError(e, [], "Fetch Schemes");
  }
};

export const checkSchemeEligibility = async (schemeTitle: string, userProfile: UserProfile, language: string) => {
  try {
    return await callAI("eligibility", { schemeTitle, userProfile, language });
  } catch (e) {
    return { isEligible: true, reason: "Could not verify automatically. Please contact local office.", steps: ["Visit nearest Agriculture Office"] };
  }
};
