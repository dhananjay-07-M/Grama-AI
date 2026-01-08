
import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  MessageCircle, 
  CloudSun, 
  Stethoscope, 
  TrendingUp, 
  BookOpen, 
  Settings as SettingsIcon, 
  Menu,
  X,
  ChevronRight,
  Globe,
  Briefcase,
  PhoneCall,
  Bell,
  Phone
} from 'lucide-react';
import { AppView, Language, UserProfile } from './types';
import HomeView from './components/HomeView';
import AssistantView from './components/AssistantView';
import WeatherView from './components/WeatherView';
import CropDoctorView from './components/CropDoctorView';
import MarketView from './components/MarketView';
import SchemesView from './components/SchemesView';
import SettingsView from './components/SettingsView';
import JobsView from './components/JobsView';
import AuthView from './components/AuthView';
import AdminView from './components/AdminView';
import { t } from './constants';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    isRegistered: false,
    isAuthenticated: false,
    name: '',
    phone: '',
    email: '',
    preferences: {
      hourlySms: true,
      schemeCalls: true,
      jobAlerts: true,
      emailReports: true
    }
  });

  const [simulatedCall, setSimulatedCall] = useState<{visible: boolean, type: string, text: string}>({
    visible: false,
    type: '',
    text: ''
  });

  // Persist Auth Session
  useEffect(() => {
    const savedProfile = localStorage.getItem('gramai_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      if (parsed.preferences?.language) setLanguage(parsed.preferences.language);
    }
    // Check for admin session
    const adminSession = localStorage.getItem('gramai_admin');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (profile.isAuthenticated) {
      localStorage.setItem('gramai_profile', JSON.stringify({...profile, preferences: { ...profile.preferences, language }}));
    }
  }, [profile, language]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Location error:", err)
      );
    }
  }, []);

  // Simulate automated alerts for registered users
  useEffect(() => {
    if (profile.isAuthenticated && profile.isRegistered && currentView === 'home' && !isAdmin) {
      const timer = setTimeout(() => {
        setSimulatedCall({
          visible: true,
          type: 'Voice Call',
          text: language === 'hi' ? 'मंड्या में नई उच्च वेतन वाली फसल नौकरी!' : 'New High-Paying Harvest Job nearby in Mandya!'
        });
      }, 15000); 
      return () => clearTimeout(timer);
    }
  }, [profile.isAuthenticated, profile.isRegistered, currentView, language, isAdmin]);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('gramai_admin', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('gramai_admin');
  };

  if (!isLoaded) return null;

  // --- ADMIN VIEW ---
  if (isAdmin) {
    return <AdminView onLogout={handleAdminLogout} />;
  }

  // --- AUTH VIEW ---
  if (!profile.isAuthenticated) {
    return (
      <AuthView 
        setProfile={setProfile} 
        language={language} 
        setLanguage={setLanguage}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  // --- FARMER APP VIEW ---
  const menuItems = [
    { id: 'home', icon: <HomeIcon size={20} />, label: t('dashboard', language) },
    { id: 'assistant', icon: <MessageCircle size={20} />, label: "Customer Care", highlight: true },
    { id: 'weather', icon: <CloudSun size={20} />, label: t('weather', language) },
    { id: 'crop-doctor', icon: <Stethoscope size={20} />, label: t('crop_doctor', language) },
    { id: 'market', icon: <TrendingUp size={20} />, label: t('market', language) },
    { id: 'jobs', icon: <Briefcase size={20} />, label: t('jobs', language) },
    { id: 'schemes', icon: <BookOpen size={20} />, label: t('schemes', language) },
    { id: 'settings', icon: <SettingsIcon size={20} />, label: t('settings', language) },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView setView={setCurrentView} language={language} location={location} />;
      case 'assistant': return <AssistantView language={language} onClose={() => setCurrentView('home')} />;
      case 'weather': return <WeatherView location={location} language={language} />;
      case 'crop-doctor': return <CropDoctorView language={language} location={location} />;
      case 'market': return <MarketView language={language} location={location} />;
      case 'jobs': return <JobsView language={language} location={location} />;
      case 'schemes': return <SchemesView language={language} profile={profile} />;
      case 'settings': return <SettingsView language={language} setLanguage={setLanguage} profile={profile} setProfile={setProfile} />;
      default: return <HomeView setView={setCurrentView} language={language} location={location} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans relative">
      
      {/* Global Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000" 
          alt="Farm Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-slate-100/80 backdrop-blur-sm"></div>
      </div>

      {/* Simulation Call Modal */}
      {simulatedCall.visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300 relative border-4 border-emerald-500">
            <div className="bg-emerald-600 p-8 text-center text-white relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=500')] opacity-20 bg-cover"></div>
              <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse relative z-10 border-4 border-emerald-400">
                <PhoneCall size={32} />
              </div>
              <h3 className="text-2xl font-bold relative z-10">GramAI Alert</h3>
              <p className="text-emerald-100 opacity-80 text-sm uppercase tracking-widest relative z-10">Incoming Call</p>
            </div>
            <div className="p-8 text-center bg-white">
              <p className="text-slate-700 font-medium text-lg mb-8 leading-relaxed">"{simulatedCall.text}"</p>
              <div className="flex gap-4">
                <button onClick={() => setSimulatedCall({...simulatedCall, visible: false})} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold uppercase tracking-wide text-xs hover:bg-red-100 transition-colors border border-red-100">Reject</button>
                <button onClick={() => setSimulatedCall({...simulatedCall, visible: false})} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold uppercase tracking-wide text-xs hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">Answer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-900/95 backdrop-blur-xl text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-emerald-800`}>
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Sidebar Background Accent */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          
          <div className="p-6 border-b border-emerald-800 relative z-10">
             <div className="flex items-center gap-3 mb-1">
                <div className="bg-emerald-500 p-2 rounded-xl shadow-lg">
                  <HomeIcon size={20} className="text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight">GRAMAI</span>
             </div>
             <p className="text-emerald-300 text-xs font-medium tracking-wide opacity-80 pl-1">Rural Empowerment</p>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 relative z-10">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as AppView);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  currentView === item.id 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/20' 
                    : (item as any).highlight ? 'bg-white/10 text-emerald-300 hover:bg-white/20' : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-white' : 'text-emerald-300'}`}>{item.icon}</span>
                  <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                </div>
                {currentView === item.id && <ChevronRight size={16} className="text-emerald-200" />}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-emerald-800 relative z-10 bg-emerald-900/50">
            <button 
              onClick={() => {
                localStorage.removeItem('gramai_profile');
                window.location.reload();
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-800 text-emerald-100 text-xs font-bold uppercase tracking-wider hover:bg-red-500/90 hover:text-white transition-all shadow-lg"
            >
              {t('logout', language)}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Layout */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative z-10">
        {/* Header - Mobile & Desktop */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4 md:hidden">
              <button onClick={() => setIsMenuOpen(true)} className="text-slate-600 hover:text-emerald-600 transition-colors"><Menu size={24} /></button>
              <span className="font-bold text-xl text-emerald-800">GRAMAI</span>
           </div>
           
           <div className="hidden md:flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">{currentView === 'assistant' ? 'Live Support' : currentView.replace('-', ' ')}</h2>
              {profile.isRegistered && (
                 <span className="bg-emerald-100/80 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 backdrop-blur-sm">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                   Verified
                 </span>
              )}
           </div>

           <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center px-4 py-2 bg-white/50 hover:bg-white transition-colors rounded-full text-slate-600 text-xs font-bold uppercase tracking-wider border border-slate-200/60 shadow-sm cursor-pointer hover:shadow-md">
                 <Globe size={14} className="mr-2 text-emerald-600" />
                 {language.toUpperCase()}
              </div>
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 md:hidden">
                <Bell size={20} />
              </button>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderView()}
           </div>
        </main>
      </div>
      
      {/* Global Call Button (Floating Action Button) */}
      {currentView !== 'assistant' && (
         <button 
           onClick={() => setCurrentView('assistant')}
           className="fixed bottom-24 md:bottom-10 right-6 z-50 w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full shadow-2xl shadow-emerald-600/40 flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95 group border-4 border-white"
         >
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
            <Phone size={28} className="animate-pulse" />
            <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">Call Support</span>
         </button>
      )}

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-black/80 backdrop-blur-xl border border-white/10 flex justify-around p-3 z-50 rounded-2xl shadow-2xl">
        <button onClick={() => setCurrentView('home')} className={`p-2 rounded-xl flex flex-col items-center transition-all ${currentView === 'home' ? 'text-emerald-400 bg-white/10' : 'text-slate-400'}`}>
           <HomeIcon size={20} />
           <span className="text-[9px] font-bold mt-1">Home</span>
        </button>
        {/* Highlighted Call Center Button in Mobile Nav */}
        <button onClick={() => setCurrentView('assistant')} className={`p-2 rounded-xl flex flex-col items-center transition-all ${currentView === 'assistant' ? 'text-white bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'text-slate-400'}`}>
           <PhoneCall size={20} />
           <span className="text-[9px] font-bold mt-1">Support</span>
        </button>
        <button onClick={() => setCurrentView('market')} className={`p-2 rounded-xl flex flex-col items-center transition-all ${currentView === 'market' ? 'text-emerald-400 bg-white/10' : 'text-slate-400'}`}>
           <TrendingUp size={20} />
           <span className="text-[9px] font-bold mt-1">Market</span>
        </button>
        <button onClick={() => setCurrentView('settings')} className={`p-2 rounded-xl flex flex-col items-center transition-all ${currentView === 'settings' ? 'text-emerald-400 bg-white/10' : 'text-slate-400'}`}>
           <SettingsIcon size={20} />
           <span className="text-[9px] font-bold mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default App;
