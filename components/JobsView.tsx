
import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, IndianRupee, Clock, CheckCircle2, PhoneCall, Search, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { findAgriJobs, AgriJob } from '../services/geminiService';

interface JobsViewProps {
  language: Language;
  location: { lat: number; lng: number } | null;
}

const MOCK_JOBS: AgriJob[] = [
  { id: 'j1', title: 'Harvesting Assistant', location: 'Mandya District', salary: '₹600 / Day', type: 'Daily Wage', description: 'Need 5 members for sugar cane harvesting. Food and transport provided.', phone: '9876543210' },
  { id: 'j2', title: 'Tractor Operator', location: 'Mysuru Rural', salary: '₹15,000 / Month', type: 'Full-time', description: 'Experienced tractor driver needed for plowing work. Accommodation available.', phone: '9123456789' },
  { id: 'j3', title: 'Nursery Caretaker', location: 'Tumakuru', salary: '₹400 / Day', type: 'Daily Wage', description: 'General maintenance and watering of saplings in local government nursery.', phone: '9988776655' },
  { id: 'j4', title: 'Loading Help', location: 'Market Yard, Hassan', salary: '₹800 / Day', type: 'Daily Wage', description: 'Heavy lifting for loading vegetable crates onto trucks during night shifts.', phone: '9112233445' },
];

const JobsView: React.FC<JobsViewProps> = ({ language, location }) => {
  const [jobs, setJobs] = useState<AgriJob[]>(MOCK_JOBS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState(location ? 'Nearby' : '');

  useEffect(() => {
    if (location) {
       // Fetch initial jobs based on coordinates if available, but for now we rely on user search or default mock
       // We can trigger an initial "general" search if we wanted:
       // handleSearch('Farm Labor', `${location.lat},${location.lng}`);
    }
  }, [location]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    // Default location string if GPS is available
    const locString = location ? `${location.lat},${location.lng}` : (searchLocation || "India");
    
    try {
      const results = await findAgriJobs(searchQuery, locString);
      if (results && results.length > 0) {
        setJobs(results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      
       {/* Header Image */}
       <div className="relative rounded-[2.5rem] overflow-hidden h-48 shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1625246333195-5519a646d9aa?auto=format&fit=crop&q=80&w=1200" 
          alt="Jobs" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent flex items-center p-8">
           <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-md px-3 py-1 rounded-full text-blue-100 text-xs font-bold uppercase tracking-widest mb-3 border border-blue-500/50">
                <Briefcase size={14} /> AI Recruitment
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Agri Jobs</h2>
              <p className="text-blue-100 text-sm max-w-md">Find verified work in your village. Connect directly with farm owners.</p>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Job Role (e.g. Tractor Driver)" 
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-700 text-sm"
             />
          </div>
          <div className="relative flex-1">
             <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               value={searchLocation}
               onChange={(e) => setSearchLocation(e.target.value)}
               placeholder="Location (e.g. Mandya)" 
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none font-bold text-slate-700 text-sm"
             />
          </div>
          <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Find Jobs'}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Latest Openings</h2>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">{loading ? "Searching..." : `${jobs.length} jobs found`}</p>
        </div>
        {!loading && (
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Alerts
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-400 font-bold">AI is finding the best jobs for you...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {jobs.map((job, idx) => (
            <div key={job.id || idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.type === 'Full-time' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {job.type}
                </span>
              </div>
              
              <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center text-sm text-slate-500 font-medium">
                  <MapPin size={16} className="mr-2 text-slate-400" /> {job.location}
                </div>
                <div className="flex items-center text-sm font-bold text-emerald-600">
                  <IndianRupee size={16} className="mr-2" /> {job.salary}
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">{job.description}</p>

              <div className="flex gap-3">
                <a href={`tel:${job.phone}`} className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md border border-emerald-100">
                  <PhoneCall size={16} /> Call Now
                </a>
                <button className="flex-1 bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-100">
                  <CheckCircle2 size={16} /> Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h4 className="text-2xl font-bold mb-2">Hire Farm Labor?</h4>
          <p className="text-emerald-200 text-sm max-w-sm leading-relaxed">Post a job description in your local language and our AI will automatically call registered workers nearby.</p>
        </div>
        <button className="relative z-10 bg-white text-emerald-900 px-8 py-4 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-xl uppercase tracking-widest">
           Post a Job Free
        </button>
      </div>
    </div>
  );
};

export default JobsView;
