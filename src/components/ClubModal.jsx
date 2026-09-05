import React from "react";
import { useAuth } from "../context/AuthContext";

const PAYU_LINK = "https://u.payu.in/PAYUMN/BrSLkzWRrctK";

export default function ClubModal({ onClose, lang = "en" }) {
  const { currentUser, loginWithGoogle } = useAuth();
  const isHindi = lang === "hi";

  const handleCheckout = async () => {
    try {
      const user = currentUser || await loginWithGoogle();
      const email = user?.email?.trim().toLowerCase();

      if (!email) {
        throw new Error("Google account email unavailable");
      }

      const message = isHindi
        ? `PayU पर भुगतान करते समय यही email लिखें:\n\n${email}\n\nअलग email लिखने पर membership अपने-आप activate नहीं होगी।`
        : `Use this exact email during PayU checkout:\n\n${email}\n\nMembership cannot activate automatically with a different email.`;

      if (!window.confirm(message)) return;
      window.location.href = PAYU_LINK;
    } catch (error) {
      window.alert(
        isHindi
          ? "भुगतान से पहले Google login पूरा नहीं हो सका। फिर कोशिश कीजिए।"
          : "Google sign-in could not be completed. Please try again."
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-white">
      <button
        onClick={onClose}
        className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1 mb-8 transition cursor-pointer"
      >
        <span>←</span>
        <span>{isHindi ? "फ़िल्मों पर वापस जाएँ" : "Back to Films"}</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-red-500 font-bold">
              {isHindi ? "सिनेमा क्लब सपोर्ट" : "SHORTSinSHORT CINEMA CLUB"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black mt-2 leading-tight">
              {isHindi ? "फ़िल्में सदैव मुफ़्त रहेंगी। आपका सहयोग क्युरेशन को सम्बल देता है।" : "Films stay free. Your support powers independent curation."}
            </h2>
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              {isHindi
                ? "₹20 के एकमुश्त सहयोग (4 सप्ताह के क्युरेशन सपोर्ट) से हमारे स्वतंत्र संकलन, आलेख और सिनेप्रेमी आर्काइव को आगे बढ़ाने में मदद करें। हम यूट्यूब फ़िल्मों के लिए कभी शुल्क नहीं लेते।"
                : "Support SHORTSinSHORT independent curation, original research, and cinephile archives with a ₹20 contribution (covers 4 weeks of curatorial support). All films remain freely accessible via authorized YouTube embeds."}
            </p>
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {isHindi ? "सहयोगियों के लिए विशेष संकलन:" : "What patrons receive:"}
            </h4>
            <ul className="text-xs text-zinc-400 space-y-2.5">
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✓</span>
                <span>{isHindi ? "क्यूरेटर का साप्ताहिक स्पेशल प्रोग्राम और मूल नोट्स" : "Curator’s Five, every week - A fresh five-film programme with an original curator note."}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✓</span>
                <span>{isHindi ? "मासिक ऑनलाइन सिनेमा रूम और सिने-चर्चा" : "Monthly Cinema Room - Community conversations on craft and independent short films."}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✓</span>
                <span>{isHindi ? "मेंबर जूरी — अगले थीम और स्पॉटलाइट पर वोट देने का अधिकार" : "Member Jury - Vote on the next theme, spotlight, and community programme."}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="text-4xl font-black text-white">₹20</div>
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">{isHindi ? "4 सप्ताह का सहयोग" : "4-WEEK PATRON CONTRIBUTION"}</div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide transition shadow-lg cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>{isHindi ? "क्लब को सपोर्ट करें — ₹20" : "Support the Club — ₹20"}</span>
          </button>

          <div className="space-y-2 text-[11px] text-zinc-500 text-center leading-relaxed">
            <p>
              {isHindi
                ? "PayU द्वारा सुरक्षित 256-बिट भुगतान। UPI, कार्ड्स और नेटबैंकिंग स्वीकार्य।"
                : "Secure 256-bit encrypted checkout via PayU. UPI, Cards & NetBanking accepted."}
            </p>
            <p className="text-zinc-400">
              {isHindi
                ? "यह 4 सप्ताह का स्वैच्छिक एकमुश्त सहयोग है (कोई ऑटो-डेबिट नहीं)।"
                : "One-time contribution for 4 weeks of curation support (No auto-debit)."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
