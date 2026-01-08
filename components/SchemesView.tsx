
import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Filter, Star, Info, Loader2, CheckCircle, XCircle, Search, Sparkles } from 'lucide-react';
import { Language, Scheme, UserProfile } from '../types';
import { fetchGovtSchemes, checkSchemeEligibility } from '../services/geminiService';

interface SchemesViewProps {
  language: Language;
  profile: UserProfile;
}

const SchemesView: React.FC<SchemesViewProps> = ({ language, profile }) => {
  const [filter, setFilter] = useState<'All' | 'Central' | 'State'>('All');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingEligibility, setCheckingEligibility] = useState<string | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<{isEligible: boolean, reason: string, steps: string[]} | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  useEffect(() => {
    loadSchemes();
  }, [language]);

  const loadSchemes = async () => {
    setLoading(true);
    const location = profile.location || 'India';
    const data = await fetchGovtSchemes(language, location);
    setSchemes(data);
    setLoading(false);
  };

  const handleCheckEligibility = async (scheme: Scheme) => {
    setCheckingEligibility(scheme.id);
    setSelectedScheme(scheme);
    setEligibilityResult(null);
    try {
      const result = await checkSchemeEligibility(scheme.title, profile, language);
      setEligibilityResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingEligibility(null);
    }
  };

  const filteredSchemes = filter === 'All' 
    ? schemes 
    : schemes.filter(s => s.type === filter);

  return (
    <div className="space-y-6 pb-10">
       {/* Header Image */}
       <div className="relative rounded-[2.5rem] overflow-hidden h-48 shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200" 
          alt="Schemes" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-transparent flex items-center p-8">
           <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/30 backdrop-blur-md px-3 py-1 rounded-full text-purple-100 text-xs font-bold uppercase tracking-widest mb-3 border border-purple-500/50">
                <BookOpen size={14} /> AI Powered
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Active Govt Schemes</h2>
              <p className="text-purple-100 text-sm max-w-md">Real-time database of government subsidies and financial aid, powered by Gemini.</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-2 text-slate-600 font-bold px-2">
           <Filter size={18} /> <span className="text-sm">Filter:</span>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1.5 w-full md:w-auto">
          {(['All', 'Central', 'State'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={loadSchemes} className="bg-slate-100 hover:bg-purple-50 text-slate-500 hover:text-purple-600 p-3 rounded-xl transition-colors">
            <Search size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Finding active schemes for you...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            {filteredSchemes.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-slate-400">No schemes found at the moment.</div>
            ) : (
                filteredSchemes.map((scheme, idx) => (
                <div key={scheme.id || idx} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group relative flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            scheme.type === 'Central' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                            {scheme.type} Govt
                        </span>
                        {scheme.link && (
                            <a href={scheme.link} target="_blank" rel="noreferrer" className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                                <ExternalLink size={18} />
                            </a>
                        )}
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 mb-3 leading-tight">{scheme.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed border-b border-slate-50 pb-4 flex-1">{scheme.description}</p>
                    
                    <div className="bg-emerald-50/80 rounded-xl p-4 flex items-start gap-3 border border-emerald-100/50 mb-5">
                    <Info size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">Benefit</p>
                        <p className="text-sm font-semibold text-emerald-700">{scheme.benefit}</p>
                    </div>
                    </div>
                    
                    <button 
                        onClick={() => handleCheckEligibility(scheme)}
                        disabled={checkingEligibility === scheme.id}
                        className="w-full py-3 border-2 border-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        {checkingEligibility === scheme.id ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        Check Eligibility
                    </button>
                </div>
                ))
            )}
        </div>
      )}

      {/* Eligibility Modal Result */}
      {eligibilityResult && selectedScheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-2 ${eligibilityResult.isEligible ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <button onClick={() => setEligibilityResult(null)} className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
                      <XCircle size={20} className="text-slate-500" />
                  </button>

                  <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 rounded-full ${eligibilityResult.isEligible ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {eligibilityResult.isEligible ? <CheckCircle size={32} /> : <Info size={32} />}
                      </div>
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligibility Check</p>
                          <h3 className="text-xl font-bold text-slate-800">{eligibilityResult.isEligible ? 'You are Eligible!' : 'May Not Be Eligible'}</h3>
                      </div>
                  </div>

                  <div className="space-y-4 mb-8">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="font-bold text-slate-700 text-sm mb-1">Analysis</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{eligibilityResult.reason}</p>
                      </div>
                      
                      <div>
                          <p className="font-bold text-slate-700 text-sm mb-2 uppercase tracking-wide">Next Steps</p>
                          <ul className="space-y-2">
                              {eligibilityResult.steps.map((step, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                      <span className="bg-slate-200 text-slate-600 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">{i+1}</span>
                                      {step}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>

                  <a href={selectedScheme.link} target="_blank" rel="noreferrer" className="block w-full text-center bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                      Apply on Official Website
                  </a>
              </div>
          </div>
      )}
      
      {!loading && (
        <div className="bg-slate-50/80 backdrop-blur-sm rounded-[2rem] p-10 text-center border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
            <Star size={32} />
            </div>
            <h4 className="font-bold text-slate-700 text-lg">More Schemes Coming Soon</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">We are actively verifying new state-specific subsidies using AI. You will be notified via SMS when new schemes are added.</p>
        </div>
      )}
    </div>
  );
};

export default SchemesView;
