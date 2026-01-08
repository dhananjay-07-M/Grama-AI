
import React from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin, Smartphone, CloudSun } from 'lucide-react';
import { Language } from '../types';

interface WeatherViewProps {
  location: { lat: number; lng: number } | null;
  language: Language;
}

const WeatherView: React.FC<WeatherViewProps> = ({ location, language }) => {
  const forecast = [
    { day: 'Tue', temp: 32, icon: <Sun className="text-amber-500" /> },
    { day: 'Wed', temp: 30, icon: <Cloud className="text-slate-400" /> },
    { day: 'Thu', temp: 28, icon: <CloudRain className="text-blue-400" /> },
    { day: 'Fri', temp: 29, icon: <CloudRain className="text-blue-400" /> },
    { day: 'Sat', temp: 33, icon: <Sun className="text-amber-500" /> },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Hero Weather Card */}
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-white min-h-[350px] flex flex-col justify-between group">
        {/* Dynamic Background Image */}
        <img 
            src="https://images.unsplash.com/photo-1592210454132-9f7325341d97?auto=format&fit=crop&q=80&w=1200" 
            alt="Weather Sky" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-600/40 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center bg-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-md text-xs font-bold mb-4 border border-white/20 shadow-sm">
              <MapPin size={14} className="mr-2" />
              <span>{location ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : 'Detecting...'}</span>
            </div>
            <h2 className="text-6xl font-bold mb-2 tracking-tighter">31°C</h2>
            <p className="text-blue-100 font-medium text-xl flex items-center gap-2">
                <Sun size={20} className="text-amber-400 animate-spin-slow" /> Partly Cloudy
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-lg">
             <CloudSun size={64} className="text-amber-300 drop-shadow-lg" />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Humidity', value: '64%', icon: <Droplets size={18} /> },
            { label: 'Wind', value: '12 km/h', icon: <Wind size={18} /> },
            { label: 'Pressure', value: '1012 hPa', icon: <Thermometer size={18} /> },
            { label: 'Rain Chance', value: '20%', icon: <CloudRain size={18} /> },
          ].map((item, idx) => (
            <div key={idx} className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-2 mb-1 text-blue-100 opacity-80">
                {item.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CloudSun className="text-blue-500" /> 5-Day Forecast
        </h3>
        <div className="flex justify-between gap-4 overflow-x-auto pb-2 no-scrollbar">
          {forecast.map((f, i) => (
            <div key={i} className="flex flex-col items-center p-4 min-w-[100px] bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all group cursor-pointer">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 group-hover:text-blue-500">{f.day}</span>
              <div className="mb-4 transform group-hover:scale-125 transition-transform duration-300">
                {f.icon}
              </div>
              <span className="text-xl font-bold text-slate-800">{f.temp}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly SMS Preview */}
      <div className="bg-emerald-900 text-white p-8 rounded-[2rem] shadow-lg relative overflow-hidden group">
        <img 
            src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=1000" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-[10s]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-900/90 to-transparent"></div>
        
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-500 p-2 rounded-xl"><Smartphone size={24} /></div>
                    <div>
                        <h3 className="font-bold text-xl">Hourly Offline Updates</h3>
                        <p className="text-emerald-300 text-xs">Active on +91 {location ? "Registered Mobile" : "..."}</p>
                    </div>
                </div>
                <p className="text-emerald-100/80 text-sm leading-relaxed max-w-sm">
                    Don't have internet on the farm? We send precise weather alerts via SMS every morning.
                </p>
            </div>
            
            <div className="flex-1">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">RECEIVED 10:00 AM</p>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <p className="text-sm font-mono text-emerald-50 leading-relaxed">
                        "GramAI Weather: Cloudy in your area. Temp 31C. Rain expected in 3 hrs. Cover harvested crops."
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherView;
