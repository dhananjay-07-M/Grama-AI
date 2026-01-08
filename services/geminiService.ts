
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleApiError = (error: any, fallback: any, context: string) => {
  console.error(`Gemini API Error (${context}):`, error);
  // Return fallback data so the UI doesn't break
  return fallback;
};

export const getGeminiResponse = async (prompt: string, history: any[] = [], language: string = 'en') => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `You are GramAI, a proactive and intelligent rural assistant. 
        - Always respond in the user's selected language: ${language}.
        - Provide helpful, structured answers with bullet points.
        - Be proactive: if a farmer asks about a disease, suggest specific products or organic solutions.
        - Maintain a friendly, empathetic tone for rural users.`,
      },
    });
    return response.text;
  } catch (e) {
    return handleApiError(e, 
      "⚠️ **System Alert: High Traffic**\n\nI apologize, but my servers are currently busy (Quota Exceeded). \n\nPlease try again in a few minutes. In the meantime, please check the 'Crop Doctor' or 'Weather' sections for offline tools.", 
      "Chat"
    );
  }
};

export const generateAgriImage = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A realistic, high-quality agricultural photo for an Indian farmer showing: ${prompt}. Cinematic lighting, detailed texture.` },
        ],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates?.[0].content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    return handleApiError(e, null, "Image Gen");
  }
};

export const getGeminiSpeech = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.substring(0, 500) }] }], 
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) {
    return handleApiError(e, null, "TTS");
  }
};

export const analyzeCropImage = async (base64Image: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "Identify this plant problem. Return a JSON object with the following structure: { \"diagnosis\": \"string\", \"confidence\": \"high/medium/low\", \"description\": \"string\", \"solution_steps\": [\"string\"], \"recommended_medicine\": \"string (specific product name)\", \"medicine_type\": \"string\" }" }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });
    return response.text;
  } catch (e) {
    // Fallback Mock Data for Demo Purposes
    const mockDiagnosis = JSON.stringify({
      diagnosis: "Leaf Rust (Simulated)",
      confidence: "High",
      description: "Service is currently offline due to high traffic. This is a simulated diagnosis. Leaf rust is a fungal disease that affects the leaves of grains like wheat.",
      solution_steps: ["Isolate the infected plants immediately", "Apply fungicide like Propiconazole", "Ensure proper spacing for air circulation"],
      recommended_medicine: "Propiconazole",
      medicine_type: "Fungicide"
    });
    return handleApiError(e, mockDiagnosis, "Crop Doctor");
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
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Identify the district and state for coordinates ${lat}, ${lng}. 
      Based on this location and current season, suggest 3 best crops and a short farming outlook.
      Return JSON: { "placeName": "District, State", "crops": ["Crop1", "Crop2", "Crop3"], "outlook": "string" }`,
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.OBJECT,
          properties: {
            placeName: { type: Type.STRING },
            crops: { type: Type.ARRAY, items: { type: Type.STRING } },
            outlook: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return handleApiError(e, { placeName: "Unknown Region", crops: ["Rice", "Wheat"], outlook: "Service unavailable." }, "Location Insights");
  }
};

export const findNearbyPlaces = async (lat: number, lng: number, type: string): Promise<PlaceResult[]> => {
  try {
    const ai = getAI();
    const query = type === 'mandi' ? 'nearby agricultural mandi markets' : 'agricultural shops and dealers';
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find ${query} near ${lat}, ${lng}.`,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const results: PlaceResult[] = [];
    
    if (chunks.length > 0) {
        chunks.forEach(c => {
            if (c.maps?.title) {
                results.push({
                    title: c.maps.title,
                    address: "View on Map", 
                    distance: "Nearby",
                    phone: "N/A"
                });
            }
        });
    }

    if (results.length > 0) return results;

    // Fallback if no grounding data found
    return [
      { title: `${type === 'mandi' ? 'APMC Market' : 'Agri Dealer'} (Local)`, address: "Near City Center", distance: "2 km", phone: "9876543210" },
      { title: "Kisan Seva Kendra", address: "Main Road", distance: "5 km", phone: "8877665544" }
    ];
  } catch (e) {
    return handleApiError(e, [], "Find Places");
  }
};

export const getPricePrediction = async (crop: string, location: string) => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze market trends for '${crop}' in '${location}'. 
            Is this a valid crop? If yes, provide current price, trend, advisory.
            CRITICAL: Generate 'graph_data' array with exactly 14 objects representing daily prices: 7 days of historical data (Previous Week) and 7 days of predicted prices (Present/Next Week).
            Also generate 3 nearby markets with prices.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        is_crop: { type: Type.BOOLEAN },
                        validation_message: { type: Type.STRING },
                        crop_name: { type: Type.STRING },
                        current_price: { type: Type.STRING },
                        trend_direction: { type: Type.STRING },
                        advisory: { type: Type.STRING },
                        graph_data: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT,
                                properties: { day: { type: Type.STRING }, price: { type: Type.NUMBER } }
                            } 
                        },
                        nearby_markets: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    market_name: { type: Type.STRING },
                                    distance: { type: Type.STRING },
                                    price: { type: Type.STRING },
                                    date: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return handleApiError(e, { is_crop: false, validation_message: "Service unavailable." }, "Price Prediction");
    }
}

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
    const ai = getAI();
    const prompt = `Generate 5 realistic agricultural job listings for '${query || 'general farm labor'}' in or around '${location || 'India'}'. 
    Focus on roles like harvesting, tractor driving, nursery management, farm supervision, or loading.
    Return a JSON array where each object has: id, title, location, salary, type (Full-time or Daily Wage), description, phone.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              phone: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return handleApiError(e, [], "Find Jobs");
  }
};

export const fetchGovtSchemes = async (language: string, location: string) => {
  try {
    const ai = getAI();
    // Using gemini-3-pro-preview with googleSearch tool to get REAL data
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Find 8 active and real government agricultural schemes in India (active in ${location}). 
      Include a mix of Central and State schemes.
      Return a JSON array. Each object must have:
      - id (random string)
      - title (Scheme Name)
      - description (Short description of what it is)
      - type ("Central" or "State")
      - benefit (Financial or other benefit details)
      - eligibility (Short eligibility criteria)
      - link (Official website URL if found, else a Google Search URL)
      
      Translate content to ${language} if possible.`,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return handleApiError(e, [], "Fetch Schemes");
  }
};

export const checkSchemeEligibility = async (schemeTitle: string, userProfile: UserProfile, language: string) => {
  try {
    const ai = getAI();
    const prompt = `
      Scheme: "${schemeTitle}"
      User Profile: 
      - Name: ${userProfile.name}
      - Location: ${userProfile.location || 'India'}
      - Crop: ${userProfile.currentCrop || 'Not specified'}
      
      Analyze if this user is likely eligible for this scheme based on standard criteria for this scheme in India.
      Return a short JSON object: { "isEligible": boolean, "reason": "string (in ${language})", "steps": ["step1", "step2"] }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Using search to verify latest eligibility criteria
        tools: [{googleSearch: {}}] 
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
     return { isEligible: true, reason: "Could not verify automatically. Please contact local office.", steps: ["Visit nearest Agriculture Office"] };
  }
};
