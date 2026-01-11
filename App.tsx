
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { AppState } from './types';
import { SYSTEM_INSTRUCTION, NTFY_TOPIC, MENU_CATEGORIES } from './constants';
import LunaOrb from './components/LunaOrb';
import { createBlob, decode, decodeAudioData } from './services/audioUtils';

// --- Review Overlay Component ---
const ReviewOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setSubmitted(true);
    setTimeout(() => {
      setRating(0);
      setComment('');
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-xl"></div>
      <div className="relative w-full max-w-lg bg-[#fcf9f2] rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-10 md:p-14 text-center border border-white/40 animate-in zoom-in-95 duration-500">
        {!submitted ? (
          <>
            <span className="text-orange-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Guest Feedback</span>
            <h3 className="font-playfair text-4xl font-bold text-[#1e3a8a] mb-2">Rate Your Experience</h3>
            <p className="text-slate-500 font-medium mb-10 italic">How was your conversation with Luna?</p>
            
            <div className="flex justify-center gap-4 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all transform hover:scale-125 ${
                    star <= rating ? 'text-orange-500' : 'text-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-6 bg-white border border-slate-100 rounded-2xl mb-8 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-medium min-h-[120px]"
            />

            <div className="flex flex-col gap-4">
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full py-5 bg-[#1e3a8a] text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-30"
              >
                Submit Review
              </button>
              <button onClick={onClose} className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600">
                Skip
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-8 shadow-lg">✓</div>
            <h3 className="font-playfair text-4xl font-bold text-[#1e3a8a] mb-2">Thank You</h3>
            <p className="text-slate-500 font-medium italic">Your feedback matters to us.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Menu Overlay Component ---
const MenuOverlay: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  initialCategory?: string;
  setCategory: (cat: string | undefined) => void;
}> = ({ isOpen, onClose, initialCategory, setCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const targetCategories = initialCategory 
    ? MENU_CATEGORIES.filter(c => 
        c.name.toLowerCase().includes(initialCategory.toLowerCase()) || 
        c.id === initialCategory.toLowerCase()
      )
    : MENU_CATEGORIES;

  const filteredResults = targetCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-lg" onClick={onClose}></div>
      <div className="relative w-full max-w-7xl bg-[#fcf9f2] rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden border border-white/40 h-[92vh] animate-in zoom-in-95 duration-500">
        <header className="px-8 py-10 md:px-16 border-b border-orange-100 bg-[#fcf9f2]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-2">
              <span className="text-orange-600 text-[10px] font-black uppercase tracking-[0.5em]">The Blue Fig Selection</span>
              <h3 className="font-playfair text-4xl md:text-6xl font-bold text-[#1e3a8a]">Curated Menu</h3>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input 
                  type="text" 
                  placeholder="Search flavors..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-medium text-slate-800 shadow-sm"
                />
              </div>
              <button onClick={onClose} className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-xl">✕</button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-12 md:px-20 space-y-24 custom-scrollbar">
          {filteredResults.map(cat => (
            <section key={cat.id}>
              <div className="flex items-center gap-6 mb-12">
                <h4 className="font-playfair text-4xl md:text-5xl font-bold text-[#1e3a8a] italic">{cat.name}</h4>
                <div className="h-[2px] bg-orange-200/50 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-16">
                {cat.items.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-baseline mb-3">
                      <h5 className="font-bold text-xl md:text-2xl text-slate-900 group-hover:text-orange-600 transition-colors">{item.name}</h5>
                      <div className="flex items-baseline gap-1 font-playfair font-black text-2xl text-slate-900 ml-4">
                        <span className="text-[10px] text-slate-400 font-sans tracking-widest uppercase align-top mt-1">JD</span>
                        <span>{item.price}</span>
                      </div>
                    </div>
                    {item.desc && <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">{item.desc}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [tableNumber, setTableNumber] = useState('');
  const [showCallWaiter, setShowCallWaiter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [menuFilter, setMenuFilter] = useState<string | undefined>();
  const [waiterStatus, setWaiterStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [transcription, setTranscription] = useState<{ user: string, luna: string }>({ user: '', luna: '' });

  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const stopSession = () => {
    if (sessionRef.current) { 
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null; 
    }
    if (scriptProcessorRef.current) { 
      scriptProcessorRef.current.disconnect(); 
      scriptProcessorRef.current = null; 
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    setAppState(AppState.IDLE);
    setTranscription({ user: '', luna: '' });
  };

  const handleEndConvo = () => {
    stopSession();
    setShowReview(true);
  };

  const sendNtfyMessage = async (title: string, message: string, tags?: string) => {
    try {
      const response = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: 'POST',
        body: message,
        headers: { 'Title': title, ...(tags ? { 'Tags': tags } : {}), 'Content-Type': 'text/plain; charset=utf-8' }
      });
      return response.ok;
    } catch (e) { return false; }
  };

  const submitReview = async (rating: number, comment: string) => {
    await sendNtfyMessage(
      `Guest Review - T${tableNumber || '?' }`,
      `Rating: ${rating} Stars\nFeedback: ${comment || 'No specific comment'}`,
      'star,thought_balloon'
    );
  };

  const startConcierge = async () => {
    if (appState !== AppState.IDLE) return;
    try {
      setAppState(AppState.CONNECTING);
      audioContextInRef.current = audioContextInRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = audioContextOutRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await audioContextInRef.current.resume();
      await audioContextOutRef.current.resume();

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Advanced Noise Cancellation Constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000
        } 
      });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setAppState(AppState.LISTENING);
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => ({ ...prev, user: message.serverContent?.inputTranscription?.text || '' }));
            }
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => ({ ...prev, luna: (prev.luna + " " + message.serverContent?.outputTranscription?.text).trim() }));
            }
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'displayMenu') {
                  setMenuFilter(fc.args.category as string);
                  setShowMenu(true);
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: [{ id: fc.id, name: fc.name, response: { result: "The menu is now visible to the guest." } }]
                  }));
                }
                if (fc.name === 'placeOrder') {
                  const items = Array.isArray(fc.args.items) ? fc.args.items : [];
                  const itemsStr = items.map((i: any) => `${i.quantity}x ${i.name}${i.notes ? ` (${i.notes})` : ''}`).join(', ');
                  const success = await sendNtfyMessage(`Order - T${fc.args.tableNumber}`, `Items: ${itemsStr}`, 'shopping_cart');
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: [{ id: fc.id, name: fc.name, response: { result: success ? "SUCCESS: The order has reached the staff. Luna, please summarize the order and confirm with the guest." : "FAILURE: Notifier system offline." } }]
                  }));
                }
              }
            }
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setAppState(AppState.SPEAKING);
              const ctx = audioContextOutRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setAppState(AppState.LISTENING);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => { 
            console.error(e);
            setAppState(AppState.ERROR); 
            stopSession(); 
          },
          onclose: () => setAppState(AppState.IDLE),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            functionDeclarations: [
              { 
                name: 'displayMenu', 
                description: 'Shows the curated menu overlay.',
                parameters: { type: Type.OBJECT, properties: { category: { type: Type.STRING } } } 
              },
              { 
                name: 'placeOrder', 
                description: 'Sends confirmed items to staff. Must have items and table number.',
                parameters: { 
                  type: Type.OBJECT, 
                  properties: { 
                    tableNumber: { type: Type.STRING }, 
                    items: { 
                      type: Type.ARRAY, 
                      items: { 
                        type: Type.OBJECT, 
                        properties: { name: { type: Type.STRING }, quantity: { type: Type.NUMBER }, notes: { type: Type.STRING } }, 
                        required: ['name', 'quantity'] 
                      } 
                    } 
                  }, 
                  required: ['tableNumber', 'items'] 
                } 
              }
            ]
          }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { 
      console.error(err);
      setAppState(AppState.ERROR); 
    }
  };

  const callWaiter = async () => {
    if (!tableNumber) return;
    setWaiterStatus('sending');
    const success = await sendNtfyMessage(`Service Call - T${tableNumber}`, `Assistance needed at table ${tableNumber}.`, 'bell');
    if (success) {
      setWaiterStatus('sent');
      setTimeout(() => { setWaiterStatus('idle'); setShowCallWaiter(false); }, 3000);
    } else { setWaiterStatus('idle'); }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <MenuOverlay isOpen={showMenu} onClose={() => setShowMenu(false)} initialCategory={menuFilter} setCategory={setMenuFilter} />
      <ReviewOverlay isOpen={showReview} onClose={() => setShowReview(false)} onSubmit={submitReview} />

      {/* Premium Navigation */}
      <nav className="p-8 md:px-16 md:py-10 flex items-center justify-between z-50">
        <div className="flex flex-col gap-1">
          <span className="font-playfair text-3xl md:text-5xl font-bold text-[#1e3a8a] italic tracking-tight">BLUE FIG</span>
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-orange-600"></span>
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-orange-600 font-black">Amman, Jordan</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {appState !== AppState.IDLE && (
            <button 
              onClick={handleEndConvo} 
              className="px-6 py-3 md:px-8 md:py-4 bg-white border-2 border-red-50 text-red-500 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-100/20 flex items-center gap-3 animate-in slide-in-from-right-4"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              End Chat
            </button>
          )}
          <button onClick={() => window.location.hash = '/login'} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white transition-colors group">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Staff</span>
          </button>
        </div>
      </nav>

      {/* Main Experience */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto w-full relative z-10 -mt-20">
        <div className="mb-16 space-y-4">
          <span className="text-orange-600 text-[11px] font-black uppercase tracking-[0.6em]">Digital Concierge</span>
          <h2 className="font-playfair text-5xl md:text-8xl text-[#1e3a8a] leading-[1.1] mb-6">Experience the <br/><span className="italic">Fusion</span></h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed opacity-70">Artistic atmosphere meets intelligent assistance. Start a conversation with Luna to order or explore our curated selection.</p>
        </div>

        <LunaOrb state={appState} onClick={appState === AppState.IDLE ? startConcierge : undefined} />

        {/* Live Subtitles */}
        <div className="h-40 w-full mt-12 flex flex-col items-center justify-center gap-4">
          {transcription.user && (
            <div className="px-6 py-2 bg-white/50 backdrop-blur-md rounded-full border border-orange-100 shadow-sm animate-in slide-in-from-bottom-2">
              <p className="text-orange-600 text-sm font-bold italic">"{transcription.user}"</p>
            </div>
          )}
          {transcription.luna && (
            <div className="max-w-3xl px-8">
              <p className="text-[#1e3a8a] font-playfair text-2xl md:text-3xl leading-snug animate-in fade-in duration-700">
                {transcription.luna}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Dock */}
        <div className="fixed bottom-12 left-0 right-0 px-6 flex flex-col items-center gap-6 z-40 pointer-events-none">
          <div className="flex bg-white/80 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/60 pointer-events-auto">
            <button onClick={() => { setMenuFilter(undefined); setShowMenu(true); }} className="px-10 py-5 bg-[#1e3a8a] text-white rounded-[2rem] shadow-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-900 transition-all active:scale-95">📖 Menu</button>
            <button onClick={() => setShowCallWaiter(true)} className="px-10 py-5 text-[#1e3a8a] font-bold uppercase tracking-widest text-xs hover:text-orange-600 transition-all active:scale-95">🛎 Assistance</button>
          </div>

          {showCallWaiter && (
            <div className="max-w-md w-full bg-[#fcf9f2] p-8 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/40 animate-in slide-in-from-bottom-8 pointer-events-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-playfair font-bold text-3xl text-[#1e3a8a]">Need Help?</h3>
                <button onClick={() => setShowCallWaiter(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">✕</button>
              </div>
              <div className="flex gap-4">
                <input type="number" placeholder="Table #" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="flex-1 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold focus:outline-none" />
                <button onClick={callWaiter} disabled={!tableNumber || waiterStatus !== 'idle'} className="bg-slate-900 text-white px-10 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-orange-600 transition-all">
                  {waiterStatus === 'idle' ? 'Alert' : waiterStatus === 'sending' ? '...' : 'Sent!'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Artistic Elements */}
      <div className="fixed -top-20 -right-20 w-96 h-96 bg-orange-100/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-20 -left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default App;
