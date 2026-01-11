
import React, { useState, useEffect, useCallback } from 'react';
import { NTFY_TOPIC } from './constants';
import { WaiterRequest } from './types';

const WaiterDashboard: React.FC = () => {
  const [requests, setRequests] = useState<WaiterRequest[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('bluefig_dismissed_ids');
    if (saved) {
      try {
        setDismissedIds(new Set(JSON.parse(saved)));
      } catch (e) { console.error(e); }
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}/json?poll=1`, { cache: 'no-cache' });
      if (!response.ok) return;
      
      const text = await response.text();
      const lines = text.trim().split('\n').filter(l => l.trim());
      
      const parsed: WaiterRequest[] = lines.map(line => {
        try {
          const data = JSON.parse(line);
          if (data.event !== 'message') return null;
          
          const title = (data.title || '').toLowerCase();
          const isOrder = title.includes('order');
          const isReview = title.includes('review');
          
          // Flexible regex to catch table numbers
          const tableMatch = data.title?.match(/(?:Table|T|#)\s*([a-zA-Z0-9]+)/i) || data.title?.match(/(\d+)/);
          const table = tableMatch ? tableMatch[1] : '?';

          let type: 'service' | 'order' | 'review' = 'service';
          if (isOrder) type = 'order';
          else if (isReview) type = 'review';

          return {
            id: data.id,
            tableNumber: table,
            message: data.message || 'Needs assistance',
            timestamp: (data.time || Date.now() / 1000) * 1000,
            type: type,
          } as WaiterRequest;
        } catch (e) { return null; }
      }).filter((r): r is WaiterRequest => r !== null);

      const now = Date.now();
      const recent = parsed.filter(r => (now - r.timestamp < 3600000)); // Last 60 mins
      
      setRequests(prev => {
        const merged = [...prev];
        recent.forEach(nr => {
          if (!merged.find(m => m.id === nr.id) && !dismissedIds.has(nr.id)) {
            merged.unshift(nr);
          }
        });
        return merged
          .filter(m => !dismissedIds.has(m.id))
          .sort((a, b) => b.timestamp - a.timestamp);
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, [dismissedIds]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 4000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const clearRequest = (id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev).add(id);
      localStorage.setItem('bluefig_dismissed_ids', JSON.stringify(Array.from(next)));
      return next;
    });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] p-6 lg:p-12 font-inter">
      <header className="max-w-5xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="font-playfair text-6xl text-[#1e3a8a] mb-2 font-bold">Service Feed</h1>
          <p className="text-orange-600 font-black uppercase tracking-[0.4em] text-[10px]">Blue Fig Operations Center</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Staff Live
          </div>
          <button onClick={() => { localStorage.removeItem('alreem_auth'); window.location.hash = '/login'; }} className="text-slate-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest transition-colors">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {requests.length === 0 ? (
          <div className="bg-white/50 rounded-[3rem] py-32 text-center border-2 border-dashed border-slate-200">
            <h3 className="font-playfair text-3xl text-slate-400 italic">No active requests</h3>
            <p className="text-slate-300 text-sm mt-2 font-medium">Sit back, or check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map(req => {
              const isOrder = req.type === 'order';
              const isReview = req.type === 'review';
              
              return (
                <div key={req.id} className={`
                  flex items-center justify-between p-8 bg-white rounded-[2.5rem] shadow-sm border transition-all animate-in slide-in-from-right-4
                  ${isOrder ? 'border-orange-200 bg-orange-50/10' : isReview ? 'border-yellow-200 bg-yellow-50/10' : 'border-blue-100'}
                `}>
                  <div className="flex items-center gap-8">
                    <div className={`
                      w-24 h-24 rounded-3xl flex flex-col items-center justify-center font-bold text-white shadow-xl
                      ${isOrder ? 'bg-orange-600' : isReview ? 'bg-yellow-500' : 'bg-[#1e3a8a]'}
                    `}>
                      <span className="text-[10px] uppercase opacity-60">Table</span>
                      <span className="text-4xl">{req.tableNumber}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOrder ? 'text-orange-600' : isReview ? 'text-yellow-600' : 'text-blue-600'}`}>
                          {isOrder ? 'Kitchen' : isReview ? 'Feedback' : 'Service'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-300">•</span>
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{new Date(req.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <h4 className="font-playfair text-3xl font-bold text-[#1e3a8a]">
                        {isOrder ? 'New Order' : isReview ? 'Guest Review' : 'Assistance Needed'}
                      </h4>
                      <p className="text-slate-600 text-xl mt-1 font-medium italic">"{req.message}"</p>
                    </div>
                  </div>
                  <button onClick={() => clearRequest(req.id)} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                    Clear
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default WaiterDashboard;
