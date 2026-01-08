
import React, { useState, useEffect } from 'react';
import { 
  CloudSun, Stethoscope, TrendingUp, BookOpen, MessageCircle,
  MapPin, Leaf, Loader2, RefreshCw, ArrowRight, Sun, Briefcase, Zap, Phone
} from 'lucide-react';
import { AppView, Language } from '../types';
import { getLocationInsights } from '../services/geminiService';
import { t } from '../constants';

interface HomeViewProps {
  setView: (view: AppView) => void;
  language: Language;
  location: { lat: number; lng: number } | null;
}

const HomeView: React.FC<HomeViewProps> = ({ setView, language, location }) => {
  const [insights, setInsights] = useState<{placeName: string, crops: string[], outlook: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. Try to load cached insights first for instant "fast" feeling
    const cached = localStorage.getItem('gramai_location_insights');
    if (cached) {
        setInsights(JSON.parse(cached));
    }

    // 2. If we have fresh location, update in background
    if (location) {
      loadLocationData();
    }
  }, [location]);

  const loadLocationData = async () => {
    if (!location) return;
    // Only show loading if we have no data at all
    if (!insights) setIsLoading(true);
    
    try {
      const data = await getLocationInsights(location.lat, location.lng);
      setInsights(data);
      // Cache the fresh data
      localStorage.setItem('gramai_location_insights', JSON.stringify(data));
    } catch (e) {
      console.error("Location Insights Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Card Component
  const ImageCard = ({ 
    id, title, desc, icon, image, large = false, onClick 
  }: { 
    id: string, title: string, desc: string, icon: React.ReactNode, image: string, large?: boolean, onClick?: () => void 
  }) => (
    <button
      onClick={onClick || (() => setView(id as AppView))}
      className={`group relative overflow-hidden rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 text-left flex flex-col justify-end ${large ? 'md:col-span-2 md:row-span-2 min-h-[300px]' : 'min-h-[200px]'}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6 w-full">
        <div className="mb-3 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-sm group-hover:bg-emerald-500 group-hover:scale-110 transition-all">
           {icon}
        </div>
        <h3 className={`font-bold text-white mb-1 leading-tight ${large ? 'text-3xl' : 'text-xl'}`}>{title}</h3>
        <p className="text-slate-300 text-sm font-medium line-clamp-2 mb-3 opacity-90">{desc}</p>
        
        <div className="flex items-center text-xs font-bold text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
           Explore <ArrowRight size={12} className="ml-1" />
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-8 pb-20">
      
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-900 shadow-2xl">
        <img 
           src="https://images.unsplash.com/photo-1625246333195-5519a646d9aa?auto=format&fit=crop&q=80&w=2000" 
           className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
           alt="Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-transparent"></div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
           <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-4">
                 <Zap size={12} fill="currentColor" /> AI-Powered Agriculture
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {t('welcome', language)}
              </h2>
              <p className="text-emerald-100 text-lg opacity-90 max-w-lg leading-relaxed">
                Your intelligent companion for weather tracking, crop health diagnosis, and market insights.
              </p>
           </div>

           {/* Live Location Card */}
           <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl w-full md:w-auto min-w-[280px]">
              <div className="flex items-center gap-3 mb-4">
                 <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg">
                    <MapPin size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold">Current Location</p>
                    <p className="text-white font-bold text-lg leading-none mt-1">
                       {isLoading ? <span className="animate-pulse">Detecting...</span> : (insights?.placeName || "India")}
                    </p>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold">{t('best_crops', language)}</p>
                 <div className="flex flex-wrap gap-2">
                    {isLoading ? (
                       <Loader2 className="animate-spin text-white/50" />
                    ) : insights?.crops?.map((c, i) => (
                       <span key={i} className="text-xs font-bold bg-emerald-500/30 text-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          {c}
                       </span>
                    )) || <span className="text-white/50 text-xs">Waiting for GPS...</span>}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Unique Bento Grid Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
         
         <ImageCard 
            id="assistant" 
            title="GramAI Customer Care"
            desc={language === 'en' ? 'Call or Chat with AI Support' : 'AI सपोर्ट से कॉल या चैट करें'}
            icon={<Phone size={32} />}
            image="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=1000"
            large={true}
            onClick={() => setView('assistant')}
         />

         <ImageCard 
            id="market" 
            title={t('market', language)} 
            desc="Real-time Mandi prices & trends"
            icon={<TrendingUp size={24} />}
            image="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1000"
         />

         <ImageCard 
            id="weather" 
            title={t('weather', language)} 
            desc="Precise local forecasts"
            icon={<CloudSun size={24} />}
            image="https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&q=80&w=1000"
         />

         <ImageCard 
            id="crop-doctor" 
            title={t('crop_doctor', language)} 
            desc="Diagnose pests & diseases instantly"
            icon={<Stethoscope size={24} />}
            image="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1000"
         />

         <ImageCard 
            id="jobs" 
            title={t('jobs', language)} 
            desc="Find local farm work"
            icon={<Briefcase size={24} />}
            image="https://img.freepik.com/free-photo/diverse-organic-farm-workers-using-laptop-manage-online-orders-bio-lettuce-grown-with-no-pesticides-while-coworkers-move-crates-man-woman-using-portable-computer-talking-about-agriculture_482257-49640.jpg"
         />

         <ImageCard 
            id="schemes" 
            title={t('schemes', language)} 
            desc="Govt subsidies & benefits"
            icon={<BookOpen size={24} />}
            image="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000"
         />
      </div>

      {/* Intelligence Alerts */}
      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg border border-white/50 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/20 transition-all"></div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-lg relative z-10">
               <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               {t('disease_alert', language)}
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm relative z-10">
               <p className="font-bold text-red-800 mb-2 text-lg">Wheat Rust Warning</p>
               <p className="text-slate-600 text-sm leading-relaxed">High risk of yellow rust detected in Mandya district due to recent humidity. Inspect your crops immediately.</p>
            </div>
         </div>

         <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg border border-white/50 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all"></div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-lg relative z-10">
               <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
               {t('subsidy_deadline', language)}
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative z-10">
               <p className="font-bold text-emerald-800 mb-2 text-lg">Solar Pump Scheme Closing</p>
               <p className="text-slate-600 text-sm leading-relaxed">Applications for the 60% subsidy on PM-KUSUM solar pumps close this Friday. Apply via the Schemes tab.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HomeView;
