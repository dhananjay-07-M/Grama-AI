
import React, { useState, useEffect } from 'react';
import { 
  Users, Megaphone, TrendingUp, LogOut, Search, Bell, ShieldAlert, FileText, 
  CheckCircle, Trash2, Save, Plus, Loader2, Info, LayoutDashboard
} from 'lucide-react';

interface AdminViewProps {
  onLogout: () => void;
}

const INITIAL_MOCK_USERS = [
  { id: '1', name: 'Ram Kishan', phone: '9876543210', location: 'Mandya', crop: 'Sugarcane', status: 'Active' },
  { id: '2', name: 'Sunita Devi', phone: '9876512345', location: 'Hassan', crop: 'Potato', status: 'Active' },
  { id: '3', name: 'Abdul Rahman', phone: '9988776655', location: 'Mysuru', crop: 'Paddy', status: 'Pending' },
  { id: '4', name: 'John Joseph', phone: '9123456789', location: 'Coorg', crop: 'Coffee', status: 'Active' },
];

const INITIAL_COMMODITIES = [
  { id: 'c1', name: 'Wheat', price: '2150', unit: 'Quintal' },
  { id: 'c2', name: 'Rice (Paddy)', price: '2040', unit: 'Quintal' },
  { id: 'c3', name: 'Tomato', price: '40', unit: 'KG' },
  { id: 'c4', name: 'Onion', price: '25', unit: 'KG' },
];

const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'farmers' | 'broadcast' | 'market'>('overview');
  const [users, setUsers] = useState<any[]>(INITIAL_MOCK_USERS);
  const [commodities, setCommodities] = useState(INITIAL_COMMODITIES);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const storedUsers = localStorage.getItem('gramai_users');
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        const realUsers = Object.values(parsed).map((u: any, idx) => ({
          id: `real-${idx}`,
          name: u.name || 'Unknown',
          phone: u.phone,
          location: 'Web Registered',
          crop: 'N/A',
          status: u.isAuthenticated ? 'Active' : 'Pending'
        }));
        setUsers(prev => [...prev, ...realUsers]);
      } catch (e) { console.error(e); }
    }
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerifyUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'Active' } : u));
    showToast("Farmer verified successfully");
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Remove this farmer?")) {
      setUsers(users.filter(u => u.id !== id));
      showToast("Farmer removed from database");
    }
  };

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setBroadcastMsg('');
      showToast("Broadcast alert sent to 1,200+ farmers");
    }, 1500);
  };

  const handleUpdatePrice = (id: string, newPrice: string) => {
    setCommodities(commodities.map(c => c.id === id ? { ...c, price: newPrice } : c));
  };

  const handleSavePrice = () => {
    showToast("Market prices updated live");
  };

  // --- Render Helpers ---
  const SidebarItem = ({ id, label, icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all text-sm font-medium ${
        activeTab === id 
          ? 'bg-slate-900 text-white border-r-4 border-emerald-500' 
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col z-20 shadow-xl">
        <div className="p-8 border-b border-slate-100">
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><div className="bg-slate-900 p-1.5 rounded-lg text-white"><ShieldAlert size={20} /></div> GramAI Admin</h1>
           <p className="text-xs text-slate-400 mt-2 font-medium ml-1">Central Command Center</p>
        </div>
        <nav className="flex-1 py-6 space-y-1">
           <SidebarItem id="overview" label="Dashboard Overview" icon={<LayoutDashboard size={18} />} />
           <SidebarItem id="farmers" label="Farmers Directory" icon={<Users size={18} />} />
           <SidebarItem id="broadcast" label="Broadcast Alerts" icon={<Megaphone size={18} />} />
           <SidebarItem id="market" label="Mandi Rate Control" icon={<TrendingUp size={18} />} />
        </nav>
        <div className="p-6 border-t border-slate-100">
           <button onClick={onLogout} className="flex items-center gap-3 text-red-600 font-bold text-sm hover:bg-red-50 p-3 rounded-xl w-full transition-colors">
              <LogOut size={18} /> Secure Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-screen">
         {/* Toast Notification */}
         {toast && (
           <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in">
             <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
               <CheckCircle size={20} className="text-emerald-400" />
               <span className="font-bold text-sm">{toast.msg}</span>
             </div>
           </div>
         )}

         {/* Mobile Header */}
         <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30">
            <span className="font-bold text-lg text-slate-800">Admin Panel</span>
            <button onClick={onLogout}><LogOut size={20} className="text-slate-500" /></button>
         </div>

         {/* Mobile Tabs */}
         <div className="md:hidden flex overflow-x-auto bg-white border-b border-slate-200 p-2 gap-2 sticky top-14 z-20">
            {['overview', 'farmers', 'broadcast', 'market'].map(t => (
               <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap ${activeTab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {t}
               </button>
            ))}
         </div>

         {/* Hero Banner */}
         <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
            <img 
               src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200" 
               className="w-full h-full object-cover opacity-40"
               alt="Admin Dashboard"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent flex items-center px-6 md:px-10">
               <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Welcome Back, Admin</h2>
                  <p className="text-slate-400 text-sm font-medium">System operational. 4 new alerts pending.</p>
               </div>
            </div>
         </div>

         <div className="p-6 md:p-10 max-w-6xl mx-auto -mt-10 relative z-10">
            
            {activeTab === 'overview' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Farmers</p>
                           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={16} /></div>
                        </div>
                        <p className="text-4xl font-bold text-slate-800">{users.length}</p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Verification</p>
                           <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ShieldAlert size={16} /></div>
                        </div>
                        <p className="text-4xl font-bold text-amber-500">{users.filter(u => u.status === 'Pending').length}</p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
                         <div className="flex justify-between items-start">
                           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">SMS Sent Today</p>
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Megaphone size={16} /></div>
                        </div>
                        <p className="text-4xl font-bold text-blue-600">1,240</p>
                     </div>
                     <div className="bg-emerald-600 p-6 rounded-2xl shadow-lg flex flex-col justify-between h-32 text-white">
                         <div className="flex justify-between items-start">
                           <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider">System Status</p>
                           <div className="p-2 bg-white/20 rounded-lg"><Info size={16} /></div>
                        </div>
                        <p className="text-2xl font-bold">All Systems Nominal</p>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText size={18} /> Recent System Logs</h3>
                     <div className="space-y-4">
                        {[
                           { msg: "Broadcast sent: 'Rain Alert - Mandya District'", time: "10 mins ago", type: "Broadcast" },
                           { msg: "New farmer registered: Ram Kishan (Verified)", time: "2 hrs ago", type: "User" },
                           { msg: "Mandi prices updated for Wheat (₹2150)", time: "5 hrs ago", type: "Market" }
                        ].map((log, i) => (
                           <div key={i} className="flex items-center gap-4 text-sm text-slate-600 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-400">
                                 {log.type[0]}
                              </div>
                              <div className="flex-1">
                                 <p className="font-bold text-slate-800">{log.msg}</p>
                                 <p className="text-xs text-slate-400 mt-1">{log.time}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'farmers' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                     <h2 className="text-xl font-bold text-slate-800 px-2">Farmer Directory</h2>
                     <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-3 w-72 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                        <Search size={16} className="text-slate-400" />
                        <input type="text" placeholder="Search name or phone..." className="bg-transparent outline-none text-sm w-full font-medium" />
                     </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                           <tr>
                              <th className="p-5">Name / Phone</th>
                              <th className="p-5">Location</th>
                              <th className="p-5">Status</th>
                              <th className="p-5 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {users.map(u => (
                              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="p-5">
                                    <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{u.phone}</p>
                                 </td>
                                 <td className="p-5 text-sm text-slate-600 font-medium">{u.location}</td>
                                 <td className="p-5">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide border ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                       {u.status}
                                    </span>
                                 </td>
                                 <td className="p-5 flex gap-2 justify-end">
                                    {u.status === 'Pending' && (
                                       <button onClick={() => handleVerifyUser(u.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors shadow-sm" title="Verify">
                                          <CheckCircle size={16} />
                                       </button>
                                    )}
                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm" title="Remove">
                                       <Trash2 size={16} />
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'broadcast' && (
               <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-slate-800">Send Alert Broadcast</h2>
                     <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">High Priority</span>
                  </div>
                  
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                     <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Alert Message</label>
                        <textarea 
                           className="w-full h-40 p-4 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none text-sm font-medium leading-relaxed"
                           placeholder="Type your alert message here... (e.g. Heavy rain expected in Mandya district. Please cover harvested crops.)"
                           value={broadcastMsg}
                           onChange={(e) => setBroadcastMsg(e.target.value)}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Target Region</label>
                           <div className="relative">
                              <select className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm bg-slate-50 font-bold text-slate-700 appearance-none">
                                 <option>All Districts</option>
                                 <option>Mandya</option>
                                 <option>Hassan</option>
                              </select>
                              <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400"><Info size={16} /></div>
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1">Channel</label>
                           <div className="relative">
                              <select className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm bg-slate-50 font-bold text-slate-700 appearance-none">
                                 <option>SMS + App Notification</option>
                                 <option>Voice Call Blast</option>
                              </select>
                              <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400"><Megaphone size={16} /></div>
                           </div>
                        </div>
                     </div>
                     <button 
                        onClick={handleBroadcast}
                        disabled={isSending || !broadcastMsg}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex justify-center gap-2 items-center shadow-lg transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isSending ? <Loader2 className="animate-spin" /> : <Megaphone size={18} />} 
                        {isSending ? 'Broadcasting...' : 'Send Alert to 1,200+ Farmers'}
                     </button>
                  </div>
               </div>
            )}

            {activeTab === 'market' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                     <h2 className="text-xl font-bold text-slate-800 px-2">Mandi Rates Management</h2>
                     <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-emerald-700 shadow-md transition-all">
                        <Plus size={16} /> Add New Crop
                     </button>
                  </div>
                  <div className="grid gap-4">
                     {commodities.map(c => (
                        <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-emerald-300 transition-colors">
                           <div>
                              <p className="font-bold text-xl text-slate-800 mb-1">{c.name}</p>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 inline-block px-2 py-1 rounded">Per {c.unit}</p>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="flex items-center border-2 border-slate-100 rounded-xl px-4 py-2 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                                 <span className="text-slate-400 mr-2 font-bold">₹</span>
                                 <input 
                                    type="number" 
                                    value={c.price} 
                                    onChange={(e) => handleUpdatePrice(c.id, e.target.value)}
                                    className="w-24 bg-transparent outline-none font-bold text-xl text-slate-800"
                                 />
                              </div>
                              <button onClick={handleSavePrice} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95">
                                 <Save size={20} />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

         </div>
      </main>
    </div>
  );
};

export default AdminView;
