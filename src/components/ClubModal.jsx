import React from 'react';

export default function ClubModal({ onClose, lang }) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 min-h-[60vh] flex flex-col justify-center text-center">
      <div className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30 rounded-3xl p-8 md:p-12 shadow-2xl space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mx-auto">
          ★
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          SHORTSinSHORT <span className="text-amber-400">Club ₹5</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          {lang === 'hi' 
            ? 'स्वतंत्र सिनेमा और रचनाकारों के समर्थन के लिए विशेष माइक्रो-मेंबरशिप। प्रीमियम क्यूरेशन और एक्सक्लूसिव रिलीज़।' 
            : 'Directly support independent filmmakers with our ₹5 micro-membership for exclusive premieres.'}
        </p>
        <div>
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition"
          >
            {lang === 'hi' ? 'वापस जाएँ' : 'Back to Stream'}
          </button>
        </div>
      </div>
    </div>
  );
}
