
import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, TrendingDown, Info, Store, MapPin, Phone, Loader2, Navigation, ArrowRight, Sparkles, XCircle, Table2, BarChart2, Image as ImageIcon } from 'lucide-react';
import { MOCK_MARKET } from '../constants';
import { Language } from '../types';
import { findNearbyPlaces, PlaceResult, getPricePrediction, generateAgriImage } from '../services/geminiService';

interface MarketViewProps {
  language: Language;
  location: { lat: number; lng: number } | null;
}

interface MarketDataPoint {
  day: string;
  price: number;
}

interface NearbyMarket {
  market_name: string;
  distance: string;
  price: string;
  date: string;
}

interface PricePrediction {
  is_crop: boolean;
  validation_message?: string;
  crop_name?: string;
  current_price?: string;
  trend_direction?: string;
  advisory?: string;
  graph_data?: MarketDataPoint[];
  nearby_markets?: NearbyMarket[];
}

const MarketView: React.FC<MarketViewProps> = ({ language, location }) => {
  const [mandis, setMandis] = useState<PlaceResult[]>([]);
  const [loadingMandis, setLoadingMandis] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  
  useEffect(() => {
    if (location) {
      loadMandis();
    }
  }, [location]);

  const loadMandis = async () => {
    if (!location) return;
    setLoadingMandis(true);
    try {
      const data = await findNearbyPlaces(location.lat, location.lng, 'mandi');
      setMandis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMandis(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsPredicting(true);
    setPrediction(null);
    setCropImage(null);

    try {
      const locString = location ? `${location.lat},${location.lng}` : "India";
      
      // Parallel execution for speed
      const [predResult, imgResult] = await Promise.all([
         getPricePrediction(searchTerm, locString),
         generateAgriImage(`Fresh organic ${searchTerm} crop pile in indian market, high quality, bright lighting`)
      ]);
      
      setPrediction(predResult);
      setCropImage(imgResult);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  const PriceGraph = ({ data }: { data: MarketDataPoint[] }) => {
    if (!data || data.length === 0) return null;
    
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    // Strict range to align max with top and min with bottom
    const range = max - min || 1;

    // Use a fixed middle index for splitting Previous vs Present week (assuming 14 days)
    const midIndex = Math.floor(data.length / 2);
    const midXPercent = (midIndex / (data.length - 1)) * 100;

    return (
      <div className="w-full bg-white rounded-2xl p-6 border border-slate-100 shadow-md mt-6 animate-in fade-in slide-in-from-bottom-4">
         {/* Header with improved legend */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h4 className="text-slate-800 font-bold flex items-center gap-2">
               <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><BarChart2 size={18} /></div>
               <div>
                  <span className="block text-sm">Price Trend Analysis</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">14-Day Forecast</span>
               </div>
            </h4>
            
            <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100 self-start sm:self-auto">
               <div className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div> Past 7 Days
               </div>
               <div className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase text-emerald-600 bg-white shadow-sm flex items-center gap-2 border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Next 7 Days
               </div>
            </div>
         </div>
         
         <div className="h-64 relative w-full mb-8">
            {/* Y-Axis Labels - Aligned with Grid Lines */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-slate-400 font-bold text-right pr-2 py-0 border-r border-slate-100 z-10">
                <span className="translate-y-[-50%]">₹{max}</span>
                <span className="translate-y-[-50%]">₹{Math.round((max*2+min)/3)}</span>
                <span className="translate-y-[-50%]">₹{Math.round((max+min*2)/3)}</span>
                <span className="translate-y-[50%]">₹{min}</span>
            </div>

            {/* Graph Area */}
            <div className="absolute left-12 right-4 top-[10px] bottom-[10px]">
                {/* Background Zones */}
                <div className="absolute inset-0 flex">
                   <div className="h-full bg-slate-50/50 border-r border-dashed border-slate-300 relative group transition-all" style={{ width: `${midXPercent}%` }}>
                      <div className="absolute bottom-2 left-2 text-[9px] font-bold text-slate-300 uppercase rotate-90 origin-bottom-left opacity-0 group-hover:opacity-100 transition-opacity">History</div>
                   </div>
                   <div className="h-full bg-emerald-50/20 relative group flex-1">
                      <div className="absolute bottom-2 right-2 text-[9px] font-bold text-emerald-200 uppercase -rotate-90 origin-bottom-right opacity-0 group-hover:opacity-100 transition-opacity">Forecast</div>
                   </div>
                </div>

                {/* Grid Lines - Aligned with Y-Labels */}
                <div className="absolute top-0 w-full border-t border-slate-100"></div>
                <div className="absolute top-1/3 w-full border-t border-slate-100 border-dashed"></div>
                <div className="absolute top-2/3 w-full border-t border-slate-100 border-dashed"></div>
                <div className="absolute bottom-0 w-full border-t border-slate-300"></div>

                {/* Today Marker */}
                <div className="absolute top-0 bottom-0 w-px bg-emerald-500/30" style={{ left: `${midXPercent}%` }}></div>
                <div className="absolute -top-4 -translate-x-1/2 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 z-10 shadow-sm" style={{ left: `${midXPercent}%` }}>
                   TODAY
                </div>

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible relative z-20">
                    <defs>
                      <linearGradient id="gradient-chart" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area */}
                    <path
                        d={`M 0,100 ${data.map((d, i) => `L ${(i/(data.length-1))*100},${100-((d.price-min)/range)*100}`).join(' ')} L 100,100 Z`}
                        fill="url(#gradient-chart)"
                    />

                    {/* Line */}
                    <polyline 
                        points={data.map((d, i) => `${(i/(data.length-1))*100},${100-((d.price-min)/range)*100}`).join(' ')} 
                        fill="none" 
                        stroke="#059669" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="drop-shadow-md"
                    />
                    
                    {/* Points - Start, Mid, End */}
                    {[0, midIndex, data.length-1].map((i) => {
                        const d = data[i];
                        if(!d) return null;
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - ((d.price - min) / range) * 100;
                        
                        return (
                           <g key={i}>
                             <circle cx={x} cy={y} r="4" fill="white" stroke="#059669" strokeWidth="2.5" className="hover:scale-125 transition-transform origin-center cursor-pointer" />
                             {/* Floating Price Label */}
                             <foreignObject x={x - 20} y={y - 30} width="40" height="25" style={{ overflow: 'visible' }}>
                                <div className="flex justify-center">
                                   <div className="bg-slate-800/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm whitespace-nowrap">₹{d.price}</div>
                                </div>
                             </foreignObject>
                           </g>
                        );
                    })}
                </svg>
            </div>

            {/* X-Axis Labels - Absolute Positioned to Match Data */}
            <div className="absolute left-12 right-4 bottom-[-20px] h-6">
                <span className="absolute left-0 -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase">{data[0]?.day}</span>
                <span className="absolute -translate-x-1/2 text-[10px] font-bold text-emerald-600 uppercase" style={{ left: `${midXPercent}%` }}>Now</span>
                <span className="absolute right-0 translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase">{data[data.length-1]?.day}</span>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Image */}
      <div className="relative rounded-[2.5rem] overflow-hidden h-48 shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200" 
          alt="Market" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center p-8">
           <div>
              <h2 className="text-3xl font-bold text-white mb-2">Mandi Market</h2>
              <p className="text-emerald-200 text-sm max-w-md">Get real-time prices from nearby mandis and AI-driven future price predictions.</p>
           </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Check Crop Price</h2>
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="e.g. Potato, Cotton..."
                 className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full transition-all"
               />
            </div>
            <button disabled={!searchTerm || isPredicting} className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-bold shadow-lg shadow-emerald-200 transition-all">
              {isPredicting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        {prediction && prediction.is_crop && (
          <div className="mb-8 animate-in fade-in space-y-6">
             {/* PREDICTION CARD */}
             <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 
                 <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="flex-1">
                       <h3 className="text-3xl font-bold capitalize mb-1">{prediction.crop_name}</h3>
                       <div className="flex items-center gap-3 mt-2 mb-6">
                          <span className="text-4xl font-bold text-emerald-400">{prediction.current_price}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${prediction.trend_direction === 'Rising' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} border border-white/10`}>
                             {prediction.trend_direction} Trend
                          </span>
                       </div>
                    </div>
                    
                    {cropImage && (
                       <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg shrink-0">
                          <img src={cropImage} alt={prediction.crop_name} className="w-full h-full object-cover" />
                       </div>
                    )}
                 </div>
                 
                 <p className="mt-2 text-sm text-slate-300 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md relative z-10 leading-relaxed">
                    <span className="font-bold text-emerald-300 uppercase tracking-wider text-xs block mb-1">AI Advisory</span> {prediction.advisory}
                 </p>
             </div>
             
             {/* Insert Graph Here */}
             <PriceGraph data={prediction.graph_data || []} />

             {/* NEARBY TABLE */}
             <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-8">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                   <MapPin size={18} className="text-emerald-600" /> Nearby Market Prices
                </div>
                <table className="w-full text-sm">
                   <thead className="bg-white text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <tr>
                         <th className="px-6 py-3 text-left">Market</th>
                         <th className="px-6 py-3 text-left">Price</th>
                         <th className="px-6 py-3 text-left">Date</th>
                         <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {prediction.nearby_markets?.map((m, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-700">{m.market_name} <span className="text-xs text-slate-400 ml-1 block">({m.distance})</span></td>
                            <td className="px-6 py-4 font-bold text-emerald-600 text-lg">{m.price}</td>
                            <td className="px-6 py-4 text-slate-500 text-xs">{m.date}</td>
                            <td className="px-6 py-4 text-right">
                               <button className="bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                                  <Phone size={16} />
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {(!prediction || !prediction.is_crop) && (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-600 text-sm">Commodity</th>
                  <th className="p-4 font-bold text-slate-600 text-sm">Price (₹)</th>
                  <th className="p-4 font-bold text-slate-600 text-sm">Unit</th>
                  <th className="p-4 font-bold text-slate-600 text-sm">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {MOCK_MARKET.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{item.commodity}</td>
                    <td className="p-4 font-bold text-emerald-600">{item.price.toLocaleString()}</td>
                    <td className="p-4 text-slate-500 text-sm font-medium">{item.unit}</td>
                    <td className="p-4">
                      <div className={`flex items-center text-sm font-bold ${item.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.change > 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                        {Math.abs(item.change)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Nearby Mandis Section */}
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-white/50">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
           <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Store size={20} /></div>
           Nearby Mandis
        </h3>
        {loadingMandis ? (
           <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
        ) : mandis.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {mandis.map((mandi, idx) => (
               <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-lg transition-all group">
                 <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{mandi.title}</h4>
                 <p className="text-xs text-slate-500 flex items-center gap-1 mt-2 mb-4 font-medium"><MapPin size={12} /> {mandi.address || "Local Market"}</p>
                 <a href={`tel:${mandi.phone?.replace(/\D/g,'') || '9876543210'}`} className="w-full block text-center bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-wide">
                    Call Market
                 </a>
               </div>
             ))}
           </div>
        ) : (
           <p className="text-center text-slate-400 text-sm py-4">No Mandis found nearby.</p>
        )}
      </div>
    </div>
  );
};

export default MarketView;
