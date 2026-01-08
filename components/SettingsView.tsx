
import React, { useState } from 'react';
import { Globe, User, Bell, Shield, LogOut, ChevronRight, Phone, Mail, CheckCircle, Smartphone, AlertCircle, QrCode, Camera } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { LANGUAGES } from '../constants';

interface SettingsViewProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ language, setLanguage, profile, setProfile }) => {
  const [isEditing, setIsEditing] = useState(!profile.isRegistered);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...profile, isRegistered: true });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      
      {/* Profile Header Image */}
      <div className="relative h-40 rounded-[2.5rem] overflow-hidden shadow-lg -mb-20 z-0">
         <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover opacity-90"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
         <div className="absolute bottom-4 right-6 text-white/80 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <User size={12} /> Personal Profile
         </div>
      </div>

      {/* KISAN IDENTITY CARD */}
      {profile.isRegistered && !isEditing && (
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 shadow-2xl text-white p-8 border-4 border-white z-10">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><Shield size={20} /></div>
                    <div>
                        <span className="block text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-200">Official Member</span>
                        <span className="font-bold tracking-tight">GramAI Kisan Card</span>
                    </div>
                 </div>
                 <QrCode size={40} className="opacity-80" />
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg relative">
                    <img src={`https://ui-avatars.com/api/?name=${profile.name}&background=fff&color=059669&size=128`} className="w-full h-full rounded-xl object-cover" alt="Profile" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                        <CheckCircle size={12} fill="currentColor" className="text-white" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">{profile.name}</h2>
                    <p className="text-emerald-100 text-sm font-medium flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full"><Phone size={12} /> +91 {profile.phone}</p>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 flex justify-between items-end">
                 <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <div>
                        <p className="text-[10px] uppercase opacity-70 font-bold tracking-wider">Current Crop</p>
                        <p className="font-bold text-lg">{profile.currentCrop || "Not Set"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase opacity-70 font-bold tracking-wider">District</p>
                        <p className="font-bold text-lg">{profile.location || "Unknown"}</p>
                    </div>
                 </div>
                 <div className="bg-white text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
                    Verified
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 z-10 relative">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
           <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><User size={20} /></div>
           {isEditing ? 'Edit Profile Details' : 'Account Information'}
        </h3>
        
        {isEditing ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Full Name</label>
               <input 
                 type="text" 
                 required
                 className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold text-slate-700" 
                 value={profile.name}
                 onChange={(e) => setProfile({...profile, name: e.target.value})}
               />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Current Crop (For AI Analysis)</label>
               <select 
                 className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold text-slate-700"
                 value={profile.currentCrop || ''}
                 onChange={(e) => setProfile({...profile, currentCrop: e.target.value})}
               >
                 <option value="">Select Crop</option>
                 <option value="Wheat">Wheat</option>
                 <option value="Rice">Rice</option>
                 <option value="Sugarcane">Sugarcane</option>
                 <option value="Cotton">Cotton</option>
                 <option value="Potato">Potato</option>
                 <option value="Tomato">Tomato</option>
               </select>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">District / Location</label>
               <input 
                 type="text" 
                 className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold text-slate-700" 
                 value={profile.location || ''}
                 onChange={(e) => setProfile({...profile, location: e.target.value})}
                 placeholder="e.g. Mandya, Karnataka"
               />
            </div>
            <div className="flex gap-3 pt-4">
               <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
               <button type="submit" className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform active:scale-95">
                 Save Changes
               </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsEditing(true)} className="w-full py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all flex justify-center items-center gap-2">
            Update Information
          </button>
        )}
      </div>

      {/* Settings Options */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-lg">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Bell size={20} /></div>
          Notification Preferences
        </h3>
        
        <div className="space-y-2">
          {[
            { key: 'hourlySms', label: 'Hourly SMS Weather', icon: <Smartphone size={18} /> },
            { key: 'schemeCalls', label: 'Scheme Voice Calls', icon: <Phone size={18} /> },
            { key: 'jobAlerts', label: 'Job Alert Calls', icon: <AlertCircle size={18} /> }
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="bg-slate-100 p-2 rounded-full text-slate-500">{pref.icon}</div>
                <span className="font-bold text-sm">{pref.label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={(profile.preferences as any)[pref.key]}
                  onChange={() => {
                    const newPrefs = { ...profile.preferences, [pref.key]: !(profile.preferences as any)[pref.key] };
                    setProfile({ ...profile, preferences: newPrefs });
                  }}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-lg">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Globe size={20} /></div>
          App Language
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(LANGUAGES) as [Language, { name: string; native: string }][]).map(([key, lang]) => (
            <button
              key={key}
              onClick={() => setLanguage(key)}
              className={`p-4 rounded-xl border text-sm font-bold text-left transition-all ${
                language === key 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
              }`}
            >
              <span className="text-lg block mb-1">{lang.native}</span>
              <span className="text-xs opacity-60 uppercase tracking-wider">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="w-full p-4 rounded-2xl bg-slate-100 text-slate-400 font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2">
        <LogOut size={18} /> Sign Out of GramAI
      </button>
    </div>
  );
};

export default SettingsView;
