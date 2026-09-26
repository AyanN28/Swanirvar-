import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { voiceEngine } from './VoiceEngine';
import { humanize, scoreHumanity } from './humanizer';
import { VoiceSaathiLogo } from '../components/VoiceSaathiLogo';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  TrendingUp,
  IndianRupee,
  FileText,
  HelpCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface VoiceMessage {
  id: string;
  sender: 'user' | 'saathi';
  text: string;
  time: string;
  humanityScore?: number;
}

export const VoiceSaathi: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome-1',
      sender: 'saathi',
      text:
        currentLanguage === 'bn'
          ? 'আচ্ছা… আমি স্বনির্ভর সাথী। আপনার ব্যবসার হিসাব, মন্ডি দর বা লোনের কথা বলুন, পাশে আছি।'
          : currentLanguage === 'hi'
          ? 'अच्छा… मैं स्वनिर्भर साथी हूँ। आपके बिज़नेस, मंडी भाव या बैंक लोन की बात बोलिए, साथ हूँ।'
          : "Well… I'm Voice Saathi. Tell me about your enterprise, mandi rates, or bank loan. I'm right here with you.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      humanityScore: 95,
    },
  ]);

  const recRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync voice engine language
  useEffect(() => {
    voiceEngine.setLanguage(currentLanguage);
    voiceEngine.onStateChange((isSpk) => {
      setSpeaking(isSpk);
    });
  }, [currentLanguage]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;

      const langMap: Record<string, string> = {
        bn: 'bn-IN',
        hi: 'hi-IN',
        en: 'en-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        pa: 'pa-IN',
        or: 'or-IN',
        ur: 'ur-IN',
        as: 'as-IN',
      };
      rec.lang = langMap[currentLanguage] || 'en-IN';

      rec.onresult = (e: any) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript;
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        const text = final || interim;
        setTranscript(text);
        if (final) {
          handleSendMessage(final);
          setListening(false);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e);
        setListening(false);
      };

      rec.onend = () => {
        setListening(false);
      };

      recRef.current = rec;
    } catch (err) {
      console.warn('Speech recognition init warning:', err);
    }
  }, [currentLanguage]);

  const toggleListening = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
    } else {
      voiceEngine.stop();
      setTranscript('');
      try {
        recRef.current?.start();
        setListening(true);
      } catch {
        // restart if active
        recRef.current?.stop();
        setTimeout(() => {
          try {
            recRef.current?.start();
            setListening(true);
          } catch {}
        }, 100);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || loading) return;

    setInputVal('');
    setTranscript('');
    const userMsg: VoiceMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: query,
          lang: currentLanguage,
          marginCapital: 150000,
          district: 'Jalpaiguri',
        }),
      });

      const data = await res.json();
      const rawReply = data?.reply || 'আচ্ছা… বিষয়টি বুঝেছি। ডিপিআর দেখে নেব?';
      const cleanReply = humanize(rawReply, currentLanguage);
      const humanityScore = scoreHumanity(cleanReply);

      const saathiMsg: VoiceMessage = {
        id: `saathi-${Date.now()}`,
        sender: 'saathi',
        text: cleanReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        humanityScore,
      };

      setMessages((prev) => [...prev, saathiMsg]);
      await voiceEngine.speakClean(cleanReply);
    } catch (err) {
      const fallback =
        currentLanguage === 'bn'
          ? 'আরে বাবা… একটু গোলমাল হয়ে গেল। আবার বলুন না?'
          : currentLanguage === 'hi'
          ? 'अरे बाप रे… थोड़ा गड़बड़ हो गया। फिर बोलिए ना?'
          : 'Bit of trouble there. Say it again?';

      setMessages((prev) => [
        ...prev,
        {
          id: `saathi-err-${Date.now()}`,
          sender: 'saathi',
          text: fallback,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          humanityScore: 92,
        },
      ]);
      await voiceEngine.speakClean(fallback);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts =
    currentLanguage === 'bn'
      ? [
          { label: '🌾 মন্ডি দর কত?', query: 'আজকের মন্ডি দর কত চলছে?' },
          { label: '💰 ১.৫ লাখে কত লোন?', query: 'আমার দেড় লাখ টাকা পুঁজি আছে, কত লোন পাব?' },
          { label: '📋 DPR কীভাবে বানাব?', query: 'ব্যাঙ্ক লোন পাওয়ার জন্য DPR কীভাবে তৈরি করব?' },
          { label: '🏪 খাতা হিসাব লিখুন', query: 'আজকের খাতা বিক্রির হিসাব কীভাবে তুলব?' },
        ]
      : currentLanguage === 'hi'
      ? [
          { label: '🌾 मंडी भाव क्या है?', query: 'आज का मंडी भाव क्या चल रहा है?' },
          { label: '💰 ₹1.5L में कितना लोन?', query: 'मेरी डेढ़ लाख की पूँजी है, कितना लोन मिलेगा?' },
          { label: '📋 DPR कैसे बनाएँ?', query: 'बैंक लोन के लिए 40-पेज DPR कैसे बनेगी?' },
          { label: '🏪 खाता हिसाब लिखें', query: 'आज की दुकान बिक्री का खाता कैसे लिखें?' },
        ]
      : [
          { label: '🌾 Live Mandi Rates', query: 'What are today mandi rates?' },
          { label: '💰 Loan on ₹1.5L Equity', query: 'How much loan can I get on 1.5 Lakh capital?' },
          { label: '📋 40-Page DPR Guide', query: 'How do I generate a bank-ready DPR?' },
          { label: '🏪 Voice Khata Entry', query: 'How do I record transactions in Bol-Khata?' },
        ];

  return (
    <>
      {/* Floating Voice Saathi Launcher Button with Dual-Figure Logo */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 select-none">
        {/* Active Speech / Listening Pill Indicator */}
        {(listening || speaking) && !isOpen && (
          <div className="bg-[#083b5e] text-white px-3.5 py-1.5 rounded-xl shadow-xl border border-amber-400 text-xs font-bold flex items-center gap-2 animate-bounce">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                listening ? 'bg-rose-500 animate-ping' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>{listening ? 'Listening to voice…' : 'Voice Saathi speaking…'}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setIsMinimized(false);
          }}
          className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-2xl transition-all transform hover:scale-105 cursor-pointer border-2 ${
            isOpen
              ? 'bg-[#083b5e] border-amber-400 text-white'
              : 'bg-white border-[#083b5e] text-[#083b5e] hover:bg-slate-50'
          }`}
          title="Open Voice Saathi (Gemini-Enabled Rural Voice Intelligence)"
          aria-label="Open Voice Saathi"
        >
          {/* Dual Figure Authentic Logo */}
          <div className="p-1 rounded-lg bg-slate-100 border border-amber-500/30 flex items-center justify-center">
            <VoiceSaathiLogo size={28} />
          </div>

          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm tracking-tight leading-none">
                Voice Saathi
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase leading-tight mt-0.5">
              {currentLanguage.toUpperCase()} · Voice AI
            </span>
          </div>

          {/* Voice Wave Mic Icon */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              listening
                ? 'bg-rose-600 text-white animate-pulse'
                : speaking
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#083b5e] text-white'
            }`}
          >
            {listening ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </div>
        </button>
      </div>

      {/* Expanded Voice Saathi Assistant Window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[410px] bg-white rounded-3xl border-2 border-[#083b5e] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized ? 'h-[72px]' : 'h-[580px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#083b5e] text-white p-3.5 px-4 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-xl bg-white/95 border border-amber-400">
                <VoiceSaathiLogo size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-white">Voice Saathi</h3>
                  <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-mono">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[10px] text-amber-200">Village Mentor & Enterprise Voice AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  voiceEngine.stop();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Conversation Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fbf9f4]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === 'user' ? 'items-end' : 'items-start'
                    } space-y-1`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] shadow-xs ${
                        m.sender === 'user'
                          ? 'bg-[#083b5e] text-white rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.text}</div>
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500 font-mono">
                      <span>{m.time}</span>
                      {m.humanityScore && (
                        <span className="text-emerald-700 font-bold">
                          Natural Tone: {m.humanityScore}%
                        </span>
                      )}
                      {m.sender === 'saathi' && (
                        <button
                          type="button"
                          onClick={() => voiceEngine.speakClean(m.text)}
                          className="hover:text-[#083b5e] cursor-pointer"
                          title="Replay Audio"
                        >
                          <Volume2 className="w-3 h-3 text-amber-700" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading / Speaking animation */}
                {loading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 max-w-[80%]">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                    <span>সাথী হিসাব করছেন…</span>
                  </div>
                )}

                {transcript && listening && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 animate-pulse">
                    <span className="font-bold block text-[10px] text-amber-700 uppercase">
                      Hearing your voice…
                    </span>
                    {transcript}
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompts */}
              <div className="p-2 px-3 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(p.query)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors shrink-0"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Mic & Input Controls */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all shadow-md shrink-0 cursor-pointer ${
                    listening
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                  }`}
                  title={listening ? 'Stop Microphone' : 'Start Voice Input (বাংলা / हिन्दी / English)'}
                >
                  {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder={
                    currentLanguage === 'bn'
                      ? 'বলুন বা টাইপ করুন (মন্ডি, লোন, DPR)…'
                      : currentLanguage === 'hi'
                      ? 'बोलें या लिखें (मंडी भाव, लोन, DPR)…'
                      : 'Speak or type (mandi, loan, DPR)…'
                  }
                  className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 focus:border-[#083b5e] focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-colors"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputVal.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-[#083b5e] hover:bg-[#062c46] disabled:opacity-40 text-white flex items-center justify-center shadow transition-colors shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
