import { GoogleGenAI, Type } from "@google/genai";

// Text models use the zero-config AI Gateway credentials.
const ai = new GoogleGenAI({});

// Image models are served through the gateway URL directly.
const imageAI = () =>
  new GoogleGenAI({
    apiKey: process.env.NETLIFY_AI_GATEWAY_KEY,
    httpOptions: { baseUrl: process.env.NETLIFY_AI_GATEWAY_URL?.replace(/\/$/, "") },
  });

const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", kn: "Kannada", ta: "Tamil", te: "Telugu", mr: "Marathi",
  bn: "Bengali", gu: "Gujarati", pa: "Punjabi", ml: "Malayalam",
};
const langName = (code: string) => LANGUAGE_NAMES[code] || code || "English";

const parseJSON = (text: string | undefined, fallback: any) => {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* ignore */ }
    }
    return fallback;
  }
};

const chat = async ({ prompt, history = [], language = "en" }: any) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: [...history, { role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: `You are GramAI, a proactive and intelligent rural assistant for Indian farmers.
        - Always respond in the user's selected language: ${langName(language)}.
        - Provide helpful, structured answers with bullet points.
        - Be proactive: if a farmer asks about a disease, suggest specific products or organic solutions.
        - Maintain a friendly, empathetic tone for rural users.`,
    },
  });
  return response.text;
};

const voiceReply = async ({ prompt, language = "en" }: any) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      systemInstruction: `You are GramAI, a phone helpline assistant for Indian farmers. Your reply is read aloud,
        so answer in 2-4 short spoken sentences in ${langName(language)}. No markdown, bullet points, or emojis.`,
    },
  });
  return response.text;
};

const image = async ({ prompt }: any) => {
  const response = await imageAI().models.generateContent({
    model: IMAGE_MODEL,
    contents: `A realistic, high-quality agricultural photo for an Indian farmer showing: ${prompt}. Cinematic lighting, detailed texture.`,
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

const analyzeCrop = async ({ image, mimeType = "image/jpeg" }: any) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: image, mimeType } },
          { text: "Identify the plant problem in this photo. If the plant looks healthy, say so in the diagnosis." },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          confidence: { type: Type.STRING, description: "high, medium or low" },
          description: { type: Type.STRING },
          solution_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommended_medicine: { type: Type.STRING, description: "specific product name" },
          medicine_type: { type: Type.STRING },
        },
        required: ["diagnosis", "confidence", "description", "solution_steps", "recommended_medicine", "medicine_type"],
      },
    },
  });
  return response.text;
};

const locationInsights = async ({ lat, lng }: any) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Identify the district and state for coordinates ${lat}, ${lng} (India).
      Today is ${new Date().toDateString()}. Based on this location and current season, suggest 3 best crops and a short farming outlook.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          placeName: { type: Type.STRING },
          crops: { type: Type.ARRAY, items: { type: Type.STRING } },
          outlook: { type: Type.STRING },
        },
        required: ["placeName", "crops", "outlook"],
      },
    },
  });
  return parseJSON(response.text, {});
};

const nearbyPlaces = async ({ lat, lng, type }: any) => {
  const query = type === "mandi" ? "agricultural mandi / APMC markets" : "agricultural input shops and fertilizer/pesticide dealers";
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `List 4 real, well-known ${query} near coordinates ${lat}, ${lng} in India.
      Use real place names where you know them. Give approximate distance from the coordinates.
      Use "N/A" for phone if you don't know it.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            address: { type: Type.STRING },
            distance: { type: Type.STRING },
            phone: { type: Type.STRING },
          },
          required: ["title", "address", "distance", "phone"],
        },
      },
    },
  });
  return parseJSON(response.text, []);
};

const pricePrediction = async ({ crop, location }: any) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Today is ${new Date().toDateString()}. Analyze Indian mandi market trends for '${crop}' in '${location}'.
      Is this a valid crop/agricultural commodity? If yes, provide current price (in ₹ per quintal), trend direction ("Rising", "Falling" or "Stable"), and an advisory.
      CRITICAL: Generate 'graph_data' array with exactly 14 objects representing daily prices: 7 days of historical data (Previous Week) and 7 days of predicted prices (Next Week).
      Also generate 3 nearby markets with prices. If it is not a crop, set is_crop false and explain in validation_message.`,
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
              properties: { day: { type: Type.STRING }, price: { type: Type.NUMBER } },
              required: ["day", "price"],
            },
          },
          nearby_markets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                market_name: { type: Type.STRING },
                distance: { type: Type.STRING },
                price: { type: Type.STRING },
                date: { type: Type.STRING },
              },
              required: ["market_name", "distance", "price", "date"],
            },
          },
        },
        required: ["is_crop"],
      },
    },
  });
  return parseJSON(response.text, { is_crop: false, validation_message: "Could not read prediction." });
};

const jobs = async ({ query, location }: any) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Generate 5 realistic agricultural job listings for '${query || "general farm labor"}' in or around '${location || "India"}'.
      Focus on roles like harvesting, tractor driving, nursery management, farm supervision, or loading.
      type must be "Full-time" or "Daily Wage". Salary in ₹.`,
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
            phone: { type: Type.STRING },
          },
          required: ["id", "title", "location", "salary", "type", "description", "phone"],
        },
      },
    },
  });
  return parseJSON(response.text, []);
};

const schemes = async ({ language, location }: any) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `List 8 real, currently active government agricultural schemes in India relevant to farmers in ${location || "India"}.
      Include a mix of Central and State schemes (e.g. PM-KISAN, PMFBY, KCC, Soil Health Card, state schemes).
      type must be "Central" or "State". link should be the official website URL.
      Write title, description, benefit and eligibility in ${langName(language)}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            benefit: { type: Type.STRING },
            eligibility: { type: Type.STRING },
            link: { type: Type.STRING },
          },
          required: ["id", "title", "description", "type", "benefit", "eligibility", "link"],
        },
      },
    },
  });
  return parseJSON(response.text, []);
};

const eligibility = async ({ schemeTitle, userProfile = {}, language }: any) => {
  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `Scheme: "${schemeTitle}"
      User Profile:
      - Name: ${userProfile.name || "Farmer"}
      - Location: ${userProfile.location || "India"}
      - Crop: ${userProfile.currentCrop || "Not specified"}

      Analyze if this user is likely eligible for this scheme based on standard criteria for this scheme in India.
      Write reason and steps in ${langName(language)}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isEligible: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["isEligible", "reason", "steps"],
      },
    },
  });
  return parseJSON(response.text, {});
};

const actions: Record<string, (payload: any) => Promise<any>> = {
  chat,
  voiceReply,
  image,
  analyzeCrop,
  locationInsights,
  nearbyPlaces,
  pricePrediction,
  jobs,
  schemes,
  eligibility,
};

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const handler = actions[body?.action];
  if (!handler) {
    return Response.json({ error: "Unknown action" }, { status: 400 });
  }
  try {
    const result = await handler(body.payload || {});
    return Response.json({ result });
  } catch (e: any) {
    console.error(`AI error (${body.action}):`, e);
    return Response.json({ error: e?.message || "AI request failed" }, { status: 502 });
  }
};

export const config = {
  path: "/api/ai",
};
