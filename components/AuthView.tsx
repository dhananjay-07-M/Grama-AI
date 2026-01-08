
import React, { useState } from 'react';
import { 
  ShieldCheck, Loader2, Leaf, Globe, 
  ChevronDown, ArrowRight,
  Sprout, TrendingUp, CloudSun, CheckCircle, MapPin, Users, HeartHandshake
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { LANGUAGES } from '../constants';

interface AuthViewProps {
  setProfile: (profile: UserProfile) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onAdminLogin: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ setProfile, language, setLanguage, onAdminLogin }) => {
  const [loginType, setLoginType] = useState<'farmer' | 'admin'>('farmer');
  const [authFlow, setAuthFlow] = useState<'login' | 'register'>('login');
  
  // Farmer State
  const [step, setStep] = useState<'mobile' | 'otp' | 'register'>('mobile');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Admin State
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Simulation State for OTP
  const [notificationCode, setNotificationCode] = useState('1234');
  const [showNotification, setShowNotification] = useState(false);

  // --- Helpers ---
  const resetForm = () => {
    setPhone('');
    setOtp('');
    setName('');
    setAuthError('');
    setAdminId('');
    setAdminPass('');
    setAdminError('');
    setStep('mobile');
    setAuthFlow('login');
    setShowNotification(false);
  };

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setAuthError('Enter valid mobile number');
      return;
    }
    setAuthError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setNotificationCode(Math.floor(1000 + Math.random() * 9000).toString());
      setStep('otp');
      setShowNotification(true);
    }, 1500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== notificationCode && otp !== '1234') {
      setAuthError("Incorrect OTP");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (authFlow === 'login') {
         const mockProfile: UserProfile = {
            isRegistered: true,
            isAuthenticated: true,
            name: 'Farmer User',
            phone: phone,
            email: '',
            preferences: { hourlySms: true, schemeCalls: true, jobAlerts: true, emailReports: false }
         };
         setProfile(mockProfile);
      } else {
         setStep('register');
      }
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const newProfile: UserProfile = {
        isRegistered: true,
        isAuthenticated: true,
        name: name,
        phone: phone,
        email: '',
        preferences: { hourlySms: true, schemeCalls: true, jobAlerts: true, emailReports: false }
      };
      setProfile(newProfile);
    }, 1000);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (adminId === 'admin123' && adminPass === '1234') {
        onAdminLogin();
      } else {
        setAdminError('Invalid Credentials');
        setIsLoading(false);
      }
    }, 1000);
  };

  const FOUNDERS = [
    "Dhananjay M",
    "Bhagyashankar",
    "Abubakar",
    "Bharath SM"
  ];

  return (
    <div className="min-h-screen font-sans bg-slate-900 text-white relative overflow-y-auto no-scrollbar selection:bg-emerald-500/30">
      
      {/* Navbar (Fixed) */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <div className="flex items-center gap-2 text-white drop-shadow-md">
               <div className="bg-emerald-600/90 p-2 rounded-xl shadow-lg border border-emerald-400/30 backdrop-blur-md"><Leaf size={20} className="fill-white" /></div>
               <span className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">GramAI</span>
           </div>
           
           <div className="relative">
               <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all text-xs font-bold border border-white/20 shadow-lg">
                  <Globe size={14} /> {LANGUAGES[language].native} <ChevronDown size={14} />
               </button>
               {showLangMenu && (
                 <div className="absolute right-0 mt-2 w-48 bg-slate-800 shadow-2xl border border-slate-700 py-2 rounded-2xl z-40 animate-in fade-in zoom-in-95 origin-top-right">
                   {Object.entries(LANGUAGES).map(([code, lang]) => (
                     <button key={code} onClick={() => { setLanguage(code as Language); setShowLangMenu(false); }} className="block w-full text-left px-5 py-2.5 text-sm font-medium hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-colors">{lang.native}</button>
                   ))}
                 </div>
               )}
           </div>
        </div>
      </nav>

      {/* 1. HERO & LOGIN SECTION */}
      <div className="relative min-h-screen flex flex-col justify-center items-center p-4 md:p-8 pt-24 pb-12">
         
         {/* Background Decor */}
         <div className="absolute inset-0 z-0">
            <img 
               src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2000" 
               alt="Rural Background" 
               className="w-full h-full object-cover fixed top-0 left-0"
            />
            <div className="absolute inset-0 bg-black/20 fixed top-0 left-0"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/60 fixed top-0 left-0"></div>
         </div>

         {/* Centered Glass Card */}
         <div className="w-full max-w-md bg-black/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-10 relative z-10 animate-in fade-in zoom-in duration-500 mt-10">
             
             {/* Header */}
             <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-200 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md mb-4">
                    <Sprout size={12} /> Smart Farming
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to GramAI</h1>
                <p className="text-slate-300 text-sm">Empowering Rural India with Technology</p>
             </div>

             {/* Login Type Toggle */}
             <div className="flex justify-center mb-8">
                <div className="bg-black/20 p-1.5 rounded-xl flex w-full border border-white/5">
                   <button onClick={() => {setLoginType('farmer'); resetForm();}} className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${loginType === 'farmer' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Farmer</button>
                   <button onClick={() => {setLoginType('admin'); resetForm();}} className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${loginType === 'admin' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Admin</button>
                </div>
             </div>

             {/* Forms */}
             <div className="w-full">
                {loginType === 'admin' ? (
                   <form onSubmit={handleAdminSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                      <div className="space-y-4">
                         <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider ml-1">Admin ID</label>
                            <input type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all font-bold text-white placeholder:text-slate-500 text-sm" placeholder="admin123" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider ml-1">Password</label>
                            <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all font-bold text-white placeholder:text-slate-500 text-sm" placeholder="••••" />
                         </div>
                      </div>

                      {adminError && <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-xs font-bold text-center border border-red-500/30 flex items-center justify-center gap-2"><ShieldCheck size={14} /> {adminError}</div>}
                      
                      <button disabled={isLoading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/50 transform active:scale-95 flex justify-center text-sm">
                         {isLoading ? <Loader2 className="animate-spin" /> : 'Secure Login'}
                      </button>
                   </form>
                ) : (
                   <>
                      {step === 'mobile' && (
                         <form onSubmit={handleMobileSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="relative group">
                               <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-emerald-400 transition-colors pointer-events-none">+91</div>
                               <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all font-bold text-lg tracking-wide text-white placeholder:text-slate-500" placeholder="98765 43210" maxLength={10} />
                            </div>

                            {authError && <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-xs font-bold text-center border border-red-500/30">{authError}</div>}

                            <button disabled={isLoading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/50 transform active:scale-95 flex justify-center items-center gap-2 text-sm">
                               {isLoading ? <Loader2 className="animate-spin" /> : <>Get Verification Code <ArrowRight size={16} /></>}
                            </button>
                         </form>
                      )}

                      {step === 'otp' && (
                         <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center mb-4">
                               <div onClick={() => setStep('mobile')} className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-emerald-400 cursor-pointer mb-4 transition-colors">
                                  Change Number
                               </div>
                               <h2 className="text-2xl font-bold text-white">Verify Identity</h2>
                               <p className="text-slate-400 text-sm font-medium mt-1">Enter code sent to +91 {phone}</p>
                            </div>

                            {showNotification && (
                               <div onClick={() => setOtp(notificationCode)} className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-emerald-500/20 transition-colors animate-in slide-in-from-top-4 shadow-sm">
                                  <div className="bg-emerald-500 p-2 rounded-full text-white shadow-sm"><ShieldCheck size={16} /></div>
                                  <div className="flex-1">
                                     <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">SMS Message</p>
                                     <p className="text-sm font-bold text-white">Your OTP is {notificationCode}</p>
                                  </div>
                                  <ArrowRight size={14} className="text-emerald-400" />
                               </div>
                            )}
                            
                            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full py-4 text-center rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all font-bold text-4xl tracking-[0.5em] text-white placeholder:text-slate-600" maxLength={4} placeholder="••••" />
                            
                            {authError && <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-xs font-bold text-center border border-red-500/30">{authError}</div>}
                            
                            <button disabled={isLoading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/50 transform active:scale-95 flex justify-center text-sm">
                               {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Proceed'}
                            </button>
                         </form>
                      )}

                      {step === 'register' && (
                         <form onSubmit={handleRegisterSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center mb-6">
                               <h2 className="text-2xl font-bold text-white">Almost There</h2>
                               <p className="text-slate-400 text-sm font-medium mt-1">Complete your profile to continue</p>
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider ml-1">Full Name</label>
                               <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all font-bold text-white text-sm" placeholder="e.g. Rajesh Kumar" />
                            </div>
                            <button disabled={isLoading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/50 transform active:scale-95 flex justify-center text-sm">
                               {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                            </button>
                         </form>
                      )}
                      
                      {step !== 'register' && (
                         <div className="text-center pt-4">
                            <button type="button" onClick={() => setAuthFlow(authFlow === 'login' ? 'register' : 'login')} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-all">
                               {authFlow === 'login' ? "Don't have an account? Register Now" : 'Already Registered? Login Here'}
                            </button>
                         </div>
                      )}
                   </>
                )}
             </div>
         </div>
      </div>

      {/* 2. FEATURES SECTION */}
      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-10 relative z-10">
         <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black/60 backdrop-blur-md p-6 rounded-[2rem] shadow-lg border border-white/10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
               <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30"><CloudSun size={28} /></div>
               <h3 className="font-bold text-white mb-2">Accurate Weather</h3>
               <p className="text-xs text-slate-300 leading-relaxed px-4">Hyper-local forecasts to help you plan your farming activities.</p>
            </div>
            <div className="bg-black/60 backdrop-blur-md p-6 rounded-[2rem] shadow-lg border border-white/10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
               <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
               <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30"><CheckCircle size={28} /></div>
               <h3 className="font-bold text-white mb-2">Crop Doctor</h3>
               <p className="text-xs text-slate-300 leading-relaxed px-4">Instant disease diagnosis using advanced AI image recognition.</p>
            </div>
            <div className="bg-black/60 backdrop-blur-md p-6 rounded-[2rem] shadow-lg border border-white/10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
               <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30"><TrendingUp size={28} /></div>
               <h3 className="font-bold text-white mb-2">Market Trends</h3>
               <p className="text-xs text-slate-300 leading-relaxed px-4">Real-time Mandi prices to ensure you get the best value.</p>
            </div>
         </div>
      </div>

      {/* 3. ABOUT THE COMPANY */}
      <div className="bg-slate-900 relative z-20 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-6">
                  <HeartHandshake size={14} /> Our Mission
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Empowering Every Farmer, Everywhere.</h2>
               <p className="text-slate-400 text-lg leading-relaxed mb-6">
                  GramAI is more than just an app; it's a movement to bridge the digital divide in rural India. We believe that cutting-edge AI shouldn't just be for tech companies, but for the hands that feed the nation.
               </p>
               <p className="text-slate-400 text-lg leading-relaxed">
                  Our goal is to increase crop yields, ensure fair prices, and provide financial security to millions of farmers through accessible, localized technology.
               </p>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 rounded-full"></div>
               <img 
                  src="https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=1200" 
                  alt="Rural India" 
                  className="relative rounded-3xl border border-white/10 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
               />
            </div>
        </div>
      </div>

      {/* 4. MEET THE TEAM (Text Only - No Images) */}
      <div className="bg-slate-950 py-20 border-t border-white/5 relative z-20">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Founders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {FOUNDERS.map((name, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-emerald-900/20 hover:border-emerald-500/30 transition-all group">
                     <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center text-xl font-bold mb-5 text-white shadow-lg group-hover:scale-110 transition-transform">
                        {name.charAt(0)}
                     </div>
                     <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
                     <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Team GramAI</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* 5. FOOTER */}
      <footer className="bg-black py-12 relative z-20 border-t border-white/10">
         <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-white mb-6 opacity-80">
               <Leaf size={24} className="fill-white" />
               <span className="text-2xl font-bold tracking-tight">GramAI</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-400 mb-2">
               <MapPin size={16} className="text-emerald-500" />
               <span className="text-sm font-medium">Srinivas University, Mukka, Mangalore</span>
            </div>
            
            <p className="text-slate-600 text-xs mt-8">© {new Date().getFullYear()} GramAI Rural Empowerment. All rights reserved.</p>
         </div>
      </footer>

    </div>
  );
};

export default AuthView;
