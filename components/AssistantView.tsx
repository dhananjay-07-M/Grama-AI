
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, PhoneOff, Phone, Grid3x3, Volume2, 
  User, Loader2, CloudSun, TrendingUp, Stethoscope, 
  ChevronDown, X, Globe, Sparkles, Delete, PlayCircle,
  MessageCircle, Send, Bot, RefreshCw
} from 'lucide-react';
import { getGeminiResponse, getGeminiSpeech } from '../services/geminiService';
import { Language, Message } from '../types';

interface AssistantViewProps {
  language: Language;
  onClose: () => void;
}

type Mode = 'voice' | 'chat';
type CallState = 'dialing' | 'connected' | 'ended';
type IVRStep = 'language-select' | 'main-menu' | 'service-active';

const AssistantView: React.FC<AssistantViewProps> = ({ language: initialLanguage, onClose }) => {
  const [mode, setMode] = useState<Mode>('voice');

  // --- VOICE STATE ---
  const [callState, setCallState] = useState<CallState>('dialing');
  const [ivrStep, setIvrStep] = useState<IVRStep>('language-select');
  const [currentLanguage, setCurrentLanguage] = useState<Language>(initialLanguage);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'speaking' | 'listening' | 'processing' | 'idle'>('idle');
  const [currentText, setCurrentText] = useState("Connecting to GramAI Server...");
  const [visualContext, setVisualContext] = useState<{type: string, title: string, data: string} | null>(null);
  
  // --- CHAT STATE ---
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Namaste! I am GramAI. Ask me anything about farming, weather, or government schemes.', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- REFS ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);

  // --- INITIALIZATION (VOICE) ---
  useEffect(() => {
    if (mode === 'voice' && callState === 'dialing') {
      const timer = setTimeout(() => {
        setCallState('connected');
        startLanguageSelection();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mode, callState]);

  // --- TIMER ---
  useEffect(() => {
    let interval: any;
    if (mode === 'voice' && callState === 'connected') {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState, mode]);

  // --- SCROLL TO BOTTOM (CHAT) ---
  useEffect(() => {
    if (mode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mode]);

  // ==============================
  // VOICE / IVR LOGIC
  // ==============================

  const startLanguageSelection = () => {
    setIvrStep('language-select');
    setShowKeypad(true);
    handleAgentSpeak(
      "Namaste. Welcome to Gram AI. Please select your language. For English, press 1. हिंदी के लिए, 2 दबाएं. ಕನ್ನಡಕ್ಕಾಗಿ, 3 ಒತ್ತಿರಿ."
    );
  };

  const startMainMenu = (lang: Language) => {
    setIvrStep('main-menu');
    setCurrentLanguage(lang);
    setShowKeypad(true);
    setVisualContext(null);
    
    const prompts: Record<string, string> = {
      en: "Welcome. How can I help you today? Press 1 for Weather Updates. Press 2 for Mandi Market Prices. Press 3 for Crop Doctor. or Press 0 to speak with me directly.",
      hi: "स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ? मौसम की जानकारी के लिए 1 दबाएं। मंडी भाव के लिए 2 दबाएं। फसल डॉक्टर के लिए 3 दबाएं। या मुझसे बात करने के लिए 0 दबाएं।",
      kn: "ಸ್ವಾಗತ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ಹವಾಮಾನ ವರದಿಗಾಗಿ 1 ಒತ್ತಿರಿ. ಮಾರುಕಟ್ಟೆ ದರಗಳಿಗಾಗಿ 2 ಒತ್ತಿರಿ. ಬೆಳೆ ವೈದ್ಯರಿಗಾಗಿ 3 ಒತ್ತಿರಿ. ಅಥವಾ ನನ್ನೊಂದಿಗೆ ಮಾತನಾಡಲು 0 ಒತ್ತಿರಿ.",
    };

    handleAgentSpeak(prompts[lang] || prompts['en']);
  };

  const handleKeypadPress = (key: string) => {
    stopAudio();

    if (ivrStep === 'language-select') {
      switch(key) {
        case '1': startMainMenu('en'); break;
        case '2': startMainMenu('hi'); break;
        case '3': startMainMenu('kn'); break;
        default: handleAgentSpeak("Invalid selection. Please press 1, 2, or 3."); break;
      }
    } 
    else if (ivrStep === 'main-menu') {
      setIvrStep('service-active');
      switch(key) {
        case '1': 
          setVisualContext({ type: 'weather', title: 'Live Weather', data: '32°C, Partly Cloudy' });
          handleAgentSpeak(currentLanguage === 'hi' ? "आपके क्षेत्र में तापमान 32 डिग्री है।" : "Current temperature is 32 degrees.");
          break;
        case '2': 
          setVisualContext({ type: 'market', title: 'Mandi Rates', data: 'Wheat: ₹2150 | Rice: ₹2040' });
          handleAgentSpeak(currentLanguage === 'hi' ? "गेहूं का भाव 2150 रुपये है।" : "Wheat is trading at 2150 rupees.");
          break;
        case '3': 
          setVisualContext({ type: 'doctor', title: 'Crop Doctor', data: 'Upload photo in app' });
          handleAgentSpeak(currentLanguage === 'hi' ? "कृपया फसल डॉक्टर सेक्शन में फोटो अपलोड करें।" : "Please upload a photo in Crop Doctor.");
          break;
        case '0': 
          setShowKeypad(false);
          handleAgentSpeak(currentLanguage === 'hi' ? "जी बताईये, मैं सुन रहा हूँ..." : "Sure, I am listening. Go ahead.");
          break;
        default: handleAgentSpeak("Invalid input."); break;
      }
    }
    else if (ivrStep === 'service-active') {
        if (key === '*') startMainMenu(currentLanguage);
    }
  };

  const stopAudio = () => {
    if (currentAudioSource.current) {
      currentAudioSource.current.stop();
      currentAudioSource.current = null;
    }
    setAgentStatus('idle');
  };

  const playAudioData = async (base64: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      stopAudio(); 
      currentAudioSource.current = source;
      setAgentStatus('speaking');
      source.start();
      
      source.onended = () => {
        setAgentStatus('listening');
        if (ivrStep === 'service-active') startListening();
      };
    } catch (e) {
      console.error("Audio playback error", e);
      setAgentStatus('listening');
    }
  };

  const handleAgentSpeak = async (text: string) => {
    setCurrentText(text);
    setAgentStatus('processing');
    const audioData = await getGeminiSpeech(text);
    if (audioData) playAudioData(audioData);
    else setAgentStatus('listening'); 
  };

  const processUserVoiceQuery = async (query: string) => {
    setAgentStatus('processing');
    try {
      const response = await getGeminiResponse(query, [], currentLanguage);
      await handleAgentSpeak(response || "Sorry, I didn't catch that.");
    } catch (e) {
      handleAgentSpeak("Connection error. Please try later.");
    }
  };

  const startListening = () => {
    if (isMuted) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (recognitionRef.current) recognitionRef.current.stop();
    
    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage === 'en' ? 'en-US' : `${currentLanguage}-IN`;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setAgentStatus('listening');
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      processUserVoiceQuery(transcript);
    };
    recognition.onerror = () => setAgentStatus('idle');
    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) { console.error("Mic error", e); }
  };

  const endCall = () => {
    stopAudio();
    if (recognitionRef.current) recognitionRef.current.stop();
    setCallState('ended');
    setAgentStatus('idle');
    setTimeout(() => {
       onClose(); 
    }, 2000);
  };

  // ==============================
  // CHAT LOGIC
  // ==============================

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsChatLoading(true);

    try {
      // Build history for context
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getGeminiResponse(newMsg.text, history, currentLanguage);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I am having trouble connecting right now.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
       console.error(e);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ==============================
  // RENDER
  // ==============================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const VisualOption = ({ num, label, subLabel, onClick }: any) => (
    <button onClick={onClick} className="flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-2xl w-full transition-all active:scale-95 group">
       <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xl text-emerald-400 border border-white/10 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors">
         {num}
       </div>
       <div className="text-left">
          <p className="font-bold text-slate-100">{label}</p>
          {subLabel && <p className="text-xs text-slate-400">{subLabel}</p>}
       </div>
    </button>
  );

  if (callState === 'ended' && mode === 'voice') {
    return (
      <div className="h-[85vh] flex flex-col items-center justify-center bg-slate-900 text-white p-8 rounded-[2.5rem] animate-in zoom-in duration-300 border-4 border-slate-800">
        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-red-500/50">
           <PhoneOff size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Call Ended</h2>
        <p className="text-slate-400 font-mono text-xl">{formatTime(callDuration)}</p>
      </div>
    );
  }

  return (
    <div className="h-[85vh] w-full max-w-sm mx-auto bg-slate-950 text-white rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col border-4 border-slate-800 ring-4 ring-slate-900/50">
      
      {/* --- HEADER TABS --- */}
      <div className="bg-slate-900/90 backdrop-blur-md p-2 flex gap-2 border-b border-white/10 relative z-30">
         <button 
           onClick={() => setMode('voice')}
           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'voice' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-transparent text-slate-400 hover:bg-white/5'}`}
         >
           <Phone size={16} /> Live Call
         </button>
         <button 
           onClick={() => setMode('chat')}
           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'chat' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-transparent text-slate-400 hover:bg-white/5'}`}
         >
           <MessageCircle size={16} /> AI Chat
         </button>
      </div>

      {/* --- VOICE MODE --- */}
      {mode === 'voice' && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none mt-16">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-emerald-900/20 to-transparent"></div>
            {agentStatus === 'speaking' && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
            )}
          </div>

          {/* Top Bar Call Info */}
          <div className="relative z-20 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-emerald-400/80">
               <Sparkles size={14} />
               <span className="text-[10px] font-bold tracking-widest uppercase">GramAI Live</span>
            </div>
            {callState === 'connected' && (
               <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/5 font-mono text-xs font-medium tracking-wider text-emerald-100 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 {formatTime(callDuration)}
               </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center relative z-10 px-6 pb-4 overflow-y-auto no-scrollbar">
            <div className="mt-4 mb-6 relative">
               {visualContext ? (
                 <div className="w-full bg-slate-800/90 backdrop-blur-md border border-slate-700 p-6 rounded-3xl animate-in zoom-in shadow-2xl">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-900/50">
                          {visualContext.type === 'weather' && <CloudSun size={32} />}
                          {visualContext.type === 'market' && <TrendingUp size={32} />}
                          {visualContext.type === 'doctor' && <Stethoscope size={32} />}
                       </div>
                    </div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{visualContext.title}</h3>
                    <p className="text-2xl font-bold text-white leading-tight">{visualContext.data}</p>
                 </div>
               ) : (
                 <div className="relative">
                     <div className={`absolute inset-0 rounded-full border border-emerald-500/30 transition-all duration-1000 ${agentStatus === 'speaking' ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`}></div>
                     <div className={`absolute inset-0 rounded-full border border-emerald-500/20 transition-all duration-1000 delay-100 ${agentStatus === 'speaking' ? 'scale-[1.8] opacity-100' : 'scale-100 opacity-0'}`}></div>
                     
                     <div className="w-32 h-32 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border-4 border-slate-600 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                        <img 
                           src="https://ui-avatars.com/api/?name=Gram+AI&background=059669&color=fff&size=200" 
                           alt="Agent" 
                           className="w-full h-full object-cover opacity-90"
                        />
                     </div>
                 </div>
               )}
            </div>

            <div className="w-full text-center space-y-4 mb-4">
               <p className="text-emerald-50 text-base font-medium leading-relaxed drop-shadow-md animate-in fade-in slide-in-from-bottom-2 min-h-[3rem]">
                 "{currentText}"
               </p>
            </div>

            {ivrStep === 'language-select' && (
               <div className="w-full space-y-2 animate-in slide-in-from-bottom-4">
                  <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Select Language</p>
                  <VisualOption num="1" label="English" onClick={() => handleKeypadPress('1')} />
                  <VisualOption num="2" label="Hindi" subLabel="हिन्दी" onClick={() => handleKeypadPress('2')} />
                  <VisualOption num="3" label="Kannada" subLabel="ಕನ್ನಡ" onClick={() => handleKeypadPress('3')} />
               </div>
            )}

            {ivrStep === 'main-menu' && (
               <div className="w-full space-y-2 animate-in slide-in-from-bottom-4">
                  <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Main Menu</p>
                  <VisualOption num="1" label="Weather" subLabel="Mausam" onClick={() => handleKeypadPress('1')} />
                  <VisualOption num="2" label="Mandi Rates" subLabel="Bhav" onClick={() => handleKeypadPress('2')} />
                  <VisualOption num="3" label="Crop Doctor" subLabel="Ilaj" onClick={() => handleKeypadPress('3')} />
                  <VisualOption num="0" label="Talk to Agent" onClick={() => handleKeypadPress('0')} />
               </div>
            )}
          </div>

          <div className={`bg-slate-900 border-t border-slate-800 relative z-20 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${showKeypad ? 'h-auto pb-4' : 'h-24'}`}>
             <div onClick={() => setShowKeypad(!showKeypad)} className="flex justify-center pt-3 pb-2 cursor-pointer active:opacity-50">
                <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
             </div>
             {showKeypad ? (
                <div className="px-6 animate-in slide-in-from-bottom-10 fade-in">
                   <div className="grid grid-cols-3 gap-3 mb-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
                        <button 
                          key={key}
                          onClick={() => handleKeypadPress(key.toString())}
                          className="aspect-[1.6/1] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 active:bg-emerald-600/20 active:border-emerald-500/50 flex flex-col items-center justify-center transition-all group"
                        >
                          <span className="text-xl font-bold text-slate-200 group-active:scale-90 transition-transform">{key}</span>
                        </button>
                      ))}
                   </div>
                   <div className="flex justify-center">
                      <button onClick={endCall} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 hover:bg-red-500 active:scale-95 transition-all">
                         <PhoneOff size={28} fill="currentColor" />
                      </button>
                   </div>
                </div>
             ) : (
               <div className="px-8 flex justify-between items-center h-14">
                  <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                     {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                  <button onClick={endCall} className="w-16 h-16 -mt-8 bg-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-900/50 hover:bg-red-500 active:scale-95 transition-all border-4 border-slate-900">
                     <PhoneOff size={28} fill="currentColor" />
                  </button>
                  <button onClick={() => setIsSpeaker(!isSpeaker)} className={`p-3 rounded-full transition-all ${isSpeaker ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                     <Volume2 size={24} />
                  </button>
               </div>
             )}
          </div>
        </>
      )}

      {/* --- CHAT MODE --- */}
      {mode === 'chat' && (
        <div className="flex-1 flex flex-col bg-slate-100 relative">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'}`}>
                   {msg.role === 'model' && <Bot size={16} className="mb-1 text-emerald-600" />}
                   {msg.text}
                   <p className={`text-[10px] mt-1 opacity-60 text-right ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                 <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                 </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask GramAI..."
                  className="flex-1 bg-slate-100 text-slate-900 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-slate-200"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isChatLoading}
                  className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                   <Send size={20} />
                </button>
             </div>
             
             {/* Quick Actions */}
             <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                {['Weather today?', 'Mandi prices?', 'Crop disease?'].map(txt => (
                   <button key={txt} onClick={() => { setInputText(txt); }} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                     {txt}
                   </button>
                ))}
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssistantView;
