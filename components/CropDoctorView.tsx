
import React, { useState, useEffect } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, Phone, Star, User, ShoppingBag, ExternalLink, Leaf, AlertTriangle, MapPin, Store, Stethoscope } from 'lucide-react';
import { analyzeCropImage, generateAgriImage, findNearbyPlaces, PlaceResult } from '../services/geminiService';
import { Language } from '../types';

interface CropDoctorViewProps {
  language: Language;
  location: { lat: number; lng: number } | null;
}

interface DiagnosisResult {
  diagnosis: string;
  confidence: string;
  description: string;
  solution_steps: string[];
  recommended_medicine: string;
  medicine_type: string;
}

const EXPERT_DOCTORS = [
  { name: "Dr. Rajesh Kumar", specialty: "Plant Pathologist", rating: 4.9, location: "Regional Agri University", phone: "+91 98XXX-XXXXX" },
  { name: "Dr. Sunita Rao", specialty: "Soil Nutritionist", rating: 4.8, location: "Krishi Vigyan Kendra", phone: "+91 97XXX-XXXXX" },
  { name: "Dr. Amit Patel", specialty: "Pest Control Specialist", rating: 4.7, location: "ICAR Associate", phone: "+91 96XXX-XXXXX" }
];

const CropDoctorView: React.FC<CropDoctorViewProps> = ({ language, location }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [medicineImage, setMedicineImage] = useState<string | null>(null);
  const [isGeneratingProduct, setIsGeneratingProduct] = useState(false);
  
  // Dealers State
  const [dealers, setDealers] = useState<PlaceResult[]>([]);
  const [loadingDealers, setLoadingDealers] = useState(false);

  useEffect(() => {
    if (location) {
      loadDealers();
    }
  }, [location]);

  const loadDealers = async () => {
    if (!location) return;
    setLoadingDealers(true);
    try {
      const data = await findNearbyPlaces(location.lat, location.lng, 'pharmacy');
      setDealers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDealers(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setSelectedImage(reader.result as string); 
        setResult(null); 
        setMedicineImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setResult(null);
    setMedicineImage(null);
    
    try {
      const base64Data = selectedImage.split(',')[1];
      const jsonString = await analyzeCropImage(base64Data);
      
      let analysisData: DiagnosisResult;
      try {
        analysisData = JSON.parse(jsonString || '{}');
      } catch (e) {
        analysisData = {
          diagnosis: "Analysis Complete",
          confidence: "Medium",
          description: jsonString || "Please consult an expert.",
          solution_steps: ["Consult local expert"],
          recommended_medicine: "General Fungicide",
          medicine_type: "Generic"
        };
      }
      
      setResult(analysisData);

      if (analysisData.recommended_medicine && analysisData.recommended_medicine !== "None") {
        setIsGeneratingProduct(true);
        const productImage = await generateAgriImage(`Package or bottle of ${analysisData.recommended_medicine} ${analysisData.medicine_type} agricultural product, clean studio background`);
        setMedicineImage(productImage);
        setIsGeneratingProduct(false);
      }

    } catch (err) {
      console.error(err);
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Image */}
      <div className="relative rounded-[2.5rem] overflow-hidden h-48 shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1200" 
          alt="Crop Doctor" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-transparent flex items-center p-8">
           <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/30 backdrop-blur-md px-3 py-1 rounded-full text-emerald-100 text-xs font-bold uppercase tracking-widest mb-3 border border-emerald-500/50">
                <Stethoscope size={14} /> AI Powered
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Crop Doctor</h2>
              <p className="text-emerald-100 text-sm max-w-md">Snap a photo of your sick plant. Our AI identifies the disease and prescribes the cure instantly.</p>
           </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white/50 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Start Diagnosis</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">Upload a clear photo of the affected leaf or stem.</p>
        
        <div className="max-w-md mx-auto relative group">
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="crop-input" />
          <label htmlFor="crop-input" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl aspect-video bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all overflow-hidden relative shadow-inner group-hover:scale-[1.02]">
            {selectedImage ? <img src={selectedImage} alt="Crop" className="w-full h-full object-cover" /> : (
              <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                   <Camera size={32} />
                </div>
                <span className="font-bold text-sm">Tap to Capture Photo</span>
              </div>
            )}
          </label>
        </div>

        {selectedImage && !result && (
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="mt-8 w-full max-w-md bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
            {isAnalyzing ? <><Loader2 className="animate-spin" /> Analyzing Crop...</> : "Run Diagnosis"}
          </button>
        )}
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
          
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-lg border-l-8 border-red-500 relative overflow-hidden">
             <div className="flex items-start gap-5 relative z-10">
                <div className="bg-red-50 p-4 rounded-2xl text-red-500 shadow-sm"><AlertTriangle size={32} /></div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{result.diagnosis}</h3>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-4 bg-red-50 inline-block px-2 py-1 rounded-md border border-red-100">Confidence: {result.confidence}</p>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">{result.description}</p>
                    
                    <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                      <h4 className="font-bold text-emerald-800 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                        <CheckCircle2 size={16} /> Treatment Plan
                      </h4>
                      <ul className="space-y-3">
                        {result.solution_steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                            <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                </div>
             </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-lg border border-white/50 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-48 h-48 bg-white rounded-3xl flex items-center justify-center border border-slate-100 p-4 shadow-inner relative">
                {isGeneratingProduct ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin" />
                    <span className="text-xs font-bold">Finding Product...</span>
                  </div>
                ) : medicineImage ? (
                  <img src={medicineImage} alt="Product" className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" />
                ) : (
                   <ShoppingBag size={48} className="text-slate-200" />
                )}
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Rec</div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-bold text-slate-800 mb-2">{result.recommended_medicine}</h4>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 bg-emerald-50 inline-block px-3 py-1 rounded-full">{result.medicine_type}</p>
                <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">This product is highly effective for {result.diagnosis}. Always check the expiry date before purchasing.</p>
                <a 
                  href={`https://www.google.com/search?q=${encodeURIComponent(result.recommended_medicine + ' agriculture')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg w-full md:w-auto"
                >
                  Buy Online <ExternalLink size={16} />
                </a>
              </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-white/50">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                   <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Store size={20} /></div>
                   Nearby Agri-Shops
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200">GPS Active</span>
             </div>
             
             {loadingDealers ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>
             ) : dealers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dealers.map((dealer, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:border-emerald-300 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800">{dealer.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium"><MapPin size={12} /> {dealer.distance} away</p>
                      </div>
                      <a href={`tel:${dealer.phone?.replace(/\D/g,'') || '9876543210'}`} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                        <Phone size={20} />
                      </a>
                    </div>
                  ))}
                </div>
             ) : (
                <p className="text-center text-slate-400 text-sm py-4">No shops found nearby.</p>
             )}
          </div>
        </div>
      )}

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXPERT_DOCTORS.map((doc, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/50 shadow-sm hover:shadow-lg transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                <User size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 leading-tight">{doc.name}</p>
                <p className="text-xs text-emerald-600 font-bold mt-0.5">{doc.specialty}</p>
                <div className="flex items-center gap-1 mt-1.5">
                   <div className="flex text-amber-400"><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></div>
                   <span className="text-[10px] text-slate-400 font-bold ml-1">{doc.rating}</span>
                </div>
              </div>
              <a href={`tel:${doc.phone.replace(/\D/g,'')}`} className="p-3 bg-slate-50 text-slate-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-colors">
                <Phone size={18} />
              </a>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CropDoctorView;
