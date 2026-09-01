import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SUBSCRIPTION_LINK = "https://rzp.io/rzp/pzRnBR1B";

const EXCLUSIVE_CONTENT = [
  {
    id: "sc-1",
    type: "script",
    title: "Ahalya - Original Screenplay Draft",
    director: "Sujoy Ghosh",
    pages: "14 Pages",
    tag: "Original PDF Script",
    desc: "सुजॉय घोष द्वारा निर्देशित चर्चित थ्रिलर 'अहल्या' की मूल शूटिंग स्क्रिप्ट ड्राफ़्ट।",
    downloadUrl: "#"
  },
  {
    id: "sc-2",
    type: "script",
    title: "Juice - Production Shooting Script",
    director: "Neeraj Ghaywan",
    pages: "18 Pages",
    tag: "Director Notes Included",
    desc: "फ़िल्मफ़ेयर विजेता शॉर्ट फ़िल्म 'जूस' की अनकट स्क्रिप्ट और सीन ब्रेकडाउन।",
    downloadUrl: "#"
  },
  {
    id: "dc-1",
    type: "vault",
    title: "The Bypass - Extended Uncut Master",
    director: "Amit Kumar (Starring Nawazuddin Siddiqui)",
    duration: "19 Min",
    tag: "Director Cut",
    desc: "बिना किसी डायलॉग वाली कल्ट क्लासिक का हाई-डेफ़िनिशन अनकट मास्टर प्रिंट।",
    youtubeId: "vBqE_o0t8f0"
  },
  {
    id: "bts-1",
    type: "bts",
    title: "Making of Kriti - Psychology of a Thriller",
    director: "Shirish Kunder",
    duration: "12 Min",
    tag: "Behind The Scenes",
    desc: "मनोवैज्ञानिक थ्रिलर के निर्माण का बिहाइंड-द-सीन्स और लाइटिंग डिज़ाइन ब्रेकडाउन।",
    youtubeId: "kY3SuB6cE58"
  }
];

export default function ClubPage({ onBack, lang }) {
  const { isPremium, loginWithGoogle, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const handleSubscribe = () => {
    if (!currentUser) {
      loginWithGoogle();
      return;
    }
    window.open(SUBSCRIPTION_LINK, '_blank');
  };

  const filtered = activeTab === 'all' 
    ? EXCLUSIVE_CONTENT 
    : EXCLUSIVE_CONTENT.filter(c => c.type === activeTab);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 pt-20 pb-16 px-4 md:px-12">
      <div className="max-w-6xl mx-auto mb-10">
        <button 
          onClick={onBack}
          className="text-xs text-zinc-400 hover:text-white mb-6 flex items-center space-x-1.5 transition cursor-pointer"
        >
          <span>←</span>
          <span>{lang === 'hi' ? "मुख्य गैलरी पर वापस जाएँ" : "Back to Film Gallery"}</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/60 via-zinc-900/90 to-zinc-950 p-6 md:p-10 border border-red-800/40 shadow-2xl">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-red-600/30 border border-red-500/50 text-red-400 text-xs font-bold rounded-full mb-3 tracking-wide uppercase">
              ★ The Cinema Insider Club
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              मूल स्क्रिप्ट्स, अनकट कट्स और मास्टरक्लास
            </h1>
            <p className="text-zinc-400 text-sm md:text-base mt-3 leading-relaxed">
              मात्र <strong className="text-red-400 font-bold">₹5 प्रति सप्ताह</strong> में भारत और विश्व सिनेमा की चुनिंदा शॉर्ट फ़िल्मों के ओरिजिनल शूटिंग स्क्रिप्ट्स, डायरेक्टर नोट्स और अनकट वॉल्ट का पूरा एक्सेस पाएँ।
            </p>

            {!isPremium ? (
              <button
                onClick={handleSubscribe}
                className="mt-6 inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm md:text-base px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 transition transform hover:scale-105 cursor-pointer"
              >
                <span>Join Club for ₹5 / Week</span>
                <span>→</span>
              </button>
            ) : (
              <div className="mt-6 inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold">
                <span>✓ Premium Pass Active - All Vaults Unlocked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8 flex space-x-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'All Vault' },
          { id: 'script', label: 'Original Scripts (PDF)' },
          { id: 'vault', label: "Director's Cut" },
          { id: 'bts', label: 'Behind The Scenes' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <div 
            key={item.id}
            className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 hover:border-red-900/60 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-950/60 text-red-400 border border-red-800/40 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
                <span className="text-xs text-zinc-500">{item.pages || item.duration}</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-1 leading-snug">{item.title}</h3>
              <p className="text-xs text-red-400 mb-3 font-medium">Dir. {item.director}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/70">
              {isPremium ? (
                <button
                  onClick={() => alert(`Opening: ${item.title}`)}
                  className="w-full bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white text-xs font-bold py-2.5 rounded-lg transition text-center cursor-pointer"
                >
                  {item.type === 'script' ? '📄 Download Script PDF' : '▶ Play Exclusive Video'}
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-red-800/50 text-red-400 text-xs font-semibold py-2.5 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>🔒 Unlock with Club Pass (₹5)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
