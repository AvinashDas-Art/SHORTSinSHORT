import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SUBSCRIPTION_LINK = "https://rzp.io/rzp/B9Z7fmQU";

const CLUB_VAULT = [
  {
    id: "ahalya",
    title: {
      en: "Ahalya",
      hi: "अहल्या"
    },
    director: "Sujoy Ghosh",
    cast: "Radhika Apte, Soumitra Chatterjee, Tota Roy Chowdhury",
    year: "2015",
    runtime: "14 mins",
    awards: "Filmfare Award Winner • Best Short Film",
    coverImg: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    globalReviews: [
      {
        source: "The Hindu",
        quote: "A taut, feminist spin on mythology that grips from the opening frame.",
        rating: "4.5/5"
      },
      {
        source: "Film Companion",
        quote: "Ghosh turns myth on its head with brilliant suspense and cinematic tension.",
        rating: "4/5"
      }
    ],
    scripts: {
      en: "https://shortsinshort.com/scripts/ahalya_en.pdf",
      hi: "https://shortsinshort.com/scripts/ahalya_hi.pdf",
      pages: "14 Pages (Screenplay Draft)"
    },
    curatorNote: {
      en: "Explore the shot-by-shot spatial construction of the mysterious Kolkata home and the original ending notes.",
      hi: "कोलकाता के रहस्यमयी घर के दृश्य निर्माण और पटकथा के मूल अंत का विश्लेषण।"
    }
  },
  {
    id: "juice",
    title: {
      en: "Juice",
      hi: "जूस"
    },
    director: "Neeraj Ghaywan",
    cast: "Shefali Shah, Manish Chaudhari",
    year: "2017",
    runtime: "15 mins",
    awards: "Filmfare Winner • Best Actress & Best Film",
    coverImg: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80",
    globalReviews: [
      {
        source: "Scroll.in",
        quote: "A quiet, devastating dismantling of everyday patriarchal microaggressions in Indian homes.",
        rating: "5/5"
      },
      {
        source: "Firstpost",
        quote: "Shefali Shah’s silent gaze delivers more emotional power than pages of monologue.",
        rating: "4.5/5"
      }
    ],
    scripts: {
      en: "https://shortsinshort.com/scripts/juice_en.pdf",
      hi: "https://shortsinshort.com/scripts/juice_hi.pdf",
      pages: "18 Pages (Shooting Script + Notes)"
    },
    curatorNote: {
      en: "Features Neeraj Ghaywan's original scene breakdowns detailing the oppressive kitchen heat vs air-conditioned living room dynamics.",
      hi: "रसोई की दमघोंटू गर्मी और ड्रॉइंग रूम की बातचीत के बीच के द्वंद्व का मूल सीन ब्रेकडाउन।"
    }
  },
  {
    id: "the-bypass",
    title: {
      en: "The Bypass",
      hi: "द बाईपास"
    },
    director: "Amit Kumar",
    cast: "Nawazuddin Siddiqui, Irrfan Khan, Sundar Dan Detha",
    year: "2003",
    runtime: "18 mins",
    awards: "BAFTA Nominated Director • Edinburgh International Film Festival",
    coverImg: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    globalReviews: [
      {
        source: "Sight & Sound (BFI)",
        quote: "A brutal, dialogue-free desert noir driven purely by visceral performances and raw editing.",
        rating: "5/5"
      },
      {
        source: "Variety",
        quote: "Nawazuddin and Irrfan deliver magnetic masterclasses in kinetic physical storytelling.",
        rating: "4.5/5"
      }
    ],
    scripts: {
      en: "https://shortsinshort.com/scripts/the_bypass_en.pdf",
      hi: "https://shortsinshort.com/scripts/the_bypass_hi.pdf",
      pages: "22 Pages (Silent Action Choreography)"
    },
    curatorNote: {
      en: "Study how a completely silent screenplay communicates high stakes, pacing, and tension purely through visual action beats.",
      hi: "बिना संवाद वाली पटकथा में दृश्य क्रियाओं और टाइमिंग के ज़रिये तनाव पैदा करने का अध्ययन।"
    }
  },
  {
    id: "chutney",
    title: {
      en: "Chutney",
      hi: "चटनी"
    },
    director: "Jyoti Kapur Das",
    cast: "Tisca Chopra, Adil Hussain, Rasika Dugal",
    year: "2016",
    runtime: "17 mins",
    awards: "Filmfare Winner • Best Actress & Best Short Film",
    coverImg: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80",
    globalReviews: [
      {
        source: "The Indian Express",
        quote: "A masterfully brewed slice-of-life that turns chillingly sinister in a split second.",
        rating: "4.5/5"
      },
      {
        source: "HuffPost",
        quote: "Tisca Chopra's performance is quiet, unpretentious, and unforgettable.",
        rating: "4/5"
      }
    ],
    scripts: {
      en: "https://shortsinshort.com/scripts/chutney_en.pdf",
      hi: "https://shortsinshort.com/scripts/chutney_hi.pdf",
      pages: "16 Pages (Original Screenplay)"
    },
    curatorNote: {
      en: "Includes the screenplay's original monologues and nuances of Ghaziabad domestic dialect.",
      hi: "पटकथा के मूल संवाद और स्थानीय भाषा के स्वाभाविक लहजे का सटीक अध्ययन।"
    }
  }
];

export default function ClubPage({ onBack, lang = 'en' }) {
  const { isPremium, loginWithGoogle, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const handleSubscribe = () => {
    if (!currentUser) {
      loginWithGoogle();
      return;
    }
    window.open(SUBSCRIPTION_LINK, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-20 pb-20 px-4 md:px-12 selection:bg-red-600 selection:text-white">
      {/* Top Breadcrumb */}
      <div className="max-w-6xl mx-auto mb-8">
        <button 
          onClick={onBack}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center space-x-2 transition group cursor-pointer"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>{lang === 'hi' ? "मुख्य फ़िल्म गैलरी पर वापस जाएँ" : "Back to Film Gallery"}</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto mb-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-[#12080a] to-[#180407] p-8 md:p-14 border border-red-900/40 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600/20 to-amber-500/20 border border-red-500/30 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-widest text-red-400">
                The Cinema Insider Vault
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Original Screenplays, Critical Essays & Insider Vault
            </h1>

            <p className="text-zinc-300 text-sm md:text-lg mt-5 leading-relaxed font-light">
              Get direct access to authentic shooting scripts in <strong className="text-white font-medium">English & Hindi</strong>, annotated director notes, and critical reception from around the world for just <span className="text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">₹5 / week</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {!isPremium ? (
                <button
                  onClick={handleSubscribe}
                  className="bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm md:text-base px-8 py-3.5 rounded-xl shadow-xl shadow-red-900/30 transition transform hover:scale-[1.02] flex items-center space-x-3 cursor-pointer"
                >
                  <span>Unlock Complete Vault for ₹5 / Week</span>
                  <span>→</span>
                </button>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>★ Cinema Insider Pass Active - Full Access Unlocked</span>
                </div>
              )}

              <span className="text-xs text-zinc-500">Cancel anytime with 1-click</span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="max-w-6xl mx-auto space-y-12">
        {CLUB_VAULT.map(film => (
          <div 
            key={film.id}
            className="bg-zinc-900/60 border border-zinc-800/80 hover:border-red-900/50 rounded-3xl p-6 md:p-8 transition-all duration-300 shadow-xl backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Film Meta & Info */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-950/60 text-red-400 border border-red-800/40 px-2.5 py-1 rounded">
                      {film.awards}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      {film.year} • {film.runtime}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {lang === 'hi' ? film.title.hi : film.title.en}
                  </h2>
                  <p className="text-sm font-semibold text-red-400 mt-1">
                    Directed by {film.director}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Starring: {film.cast}
                  </p>

                  {/* Curator Note */}
                  <div className="mt-5 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-red-400 uppercase tracking-wider text-[10px] block mb-1">
                      Vault Analysis & Screenplay Study:
                    </strong>
                    {lang === 'hi' ? film.curatorNote.hi : film.curatorNote.en}
                  </div>
                </div>

                {/* Script Download Buttons */}
                <div className="pt-4 border-t border-zinc-800/80">
                  <span className="text-xs text-zinc-400 font-medium block mb-3">
                    Available Shooting Scripts ({film.scripts.pages}):
                  </span>

                  <div className="flex flex-wrap gap-3">
                    {isPremium ? (
                      <>
                        <a
                          href={film.scripts.en}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center space-x-2 transition"
                        >
                          <span>📄</span>
                          <span>Read Script (English Draft)</span>
                        </a>
                        <a
                          href={film.scripts.hi}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold px-4 py-2.5 rounded-lg border border-zinc-700 flex items-center space-x-2 transition"
                        >
                          <span>📄</span>
                          <span>पटकथा पढ़ें (हिंदी ड्राफ़्ट)</span>
                        </a>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleSubscribe}
                          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-red-900/30 text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center space-x-2 cursor-pointer"
                        >
                          <span>🔒</span>
                          <span>Unlock English Screenplay Draft</span>
                        </button>
                        <button
                          onClick={handleSubscribe}
                          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-red-900/30 text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center space-x-2 cursor-pointer"
                        >
                          <span>🔒</span>
                          <span>हिंदी पटकथा अनलॉक करें</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Global Critical Reviews */}
              <div className="lg:col-span-5 bg-zinc-950/70 rounded-2xl p-6 border border-zinc-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                    <span className="text-xs uppercase tracking-widest font-black text-amber-400 flex items-center space-x-1.5">
                      <span>★</span>
                      <span>Global Critical Reception</span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    {film.globalReviews.map((rev, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200">{rev.source}</span>
                          <span className="text-[11px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/30">
                            ★ {rev.rating}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 italic leading-snug">
                          "{rev.quote}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {!isPremium && (
                  <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                    <button
                      onClick={handleSubscribe}
                      className="w-full bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/40 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Join Club for ₹5/Week to Read All Reviews & Notes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
