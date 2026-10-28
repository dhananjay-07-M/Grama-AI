// Live weather from Open-Meteo (free, no API key required).

export interface DailyForecast {
  date: string;
  day: string;
  max: number;
  min: number;
  code: number;
  rainChance: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  wind: number;
  pressure: number;
  code: number;
  rainChance: number;
  placeName?: string;
  daily: DailyForecast[];
}

export const describeWeather = (code: number): string => {
  if (code === 0) return 'Clear Sky';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
};

export const getWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code',
    hourly: 'precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '7',
    timezone: 'auto',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const data = await res.json();

  // Rain chance for the current hour
  const nowHour = (data.current?.time || '').slice(0, 13);
  const hourIdx = (data.hourly?.time || []).findIndex((t: string) => t.startsWith(nowHour));
  const rainChance = hourIdx >= 0 ? data.hourly.precipitation_probability[hourIdx] ?? 0 : data.daily?.precipitation_probability_max?.[0] ?? 0;

  const daily: DailyForecast[] = (data.daily?.time || []).map((date: string, i: number) => ({
    date,
    day: new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' }),
    max: Math.round(data.daily.temperature_2m_max[i]),
    min: Math.round(data.daily.temperature_2m_min[i]),
    code: data.daily.weather_code[i],
    rainChance: data.daily.precipitation_probability_max?.[i] ?? 0,
  }));

  let placeName: string | undefined;
  try {
    const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${lat}&lon=${lng}`);
    if (geo.ok) {
      const g = await geo.json();
      const a = g.address || {};
      placeName = [a.city || a.town || a.village || a.county || a.state_district, a.state].filter(Boolean).join(', ') || undefined;
    }
  } catch { /* place name is optional */ }

  return {
    temperature: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    wind: Math.round(data.current.wind_speed_10m),
    pressure: Math.round(data.current.surface_pressure),
    code: data.current.weather_code,
    rainChance,
    placeName,
    daily,
  };
};

export const weatherAdvice = (w: WeatherData): string => {
  const rainSoon = w.rainChance >= 50 || w.daily.slice(0, 2).some(d => d.rainChance >= 60);
  if (rainSoon) return `${describeWeather(w.code)}. Temp ${w.temperature}C. Rain likely soon - cover harvested crops and delay spraying.`;
  if (w.temperature >= 35) return `Hot day at ${w.temperature}C. Irrigate in the early morning or evening and protect livestock from heat.`;
  if (w.wind >= 25) return `Windy (${w.wind} km/h). Avoid pesticide spraying today.`;
  return `${describeWeather(w.code)}, ${w.temperature}C. Good conditions for field work and spraying.`;
};
