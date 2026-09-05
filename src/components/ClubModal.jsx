import React from "react";

export default function ClubModal({ onClose, lang = "en" }) {
  const handlePayUCheckout = async () => {
    const key = "C93YXO";
    const salt = "zDhUoiR5IDgshAVb40Owm0LAnvhpnwrp";
    const txnid = "TXN" + Date.now();
    const amount = "20.00";
    const productinfo = "CinemaClub";
    const firstname = "Member";
    const email = "member@shortsinshort.com";
    const phone = "9999999999";
    const surl = window.location.origin + "/?payment=success";
    const furl = window.location.origin + "/?payment=failed";
    const udf1 = "";
    const udf2 = "";
    const udf3 = "";
    const udf4 = "";
    const udf5 = "";

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest("SHA-512", enc.encode(hashString));
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hash = hashArr.map(b => b.toString(16).padStart(2, "0")).join("").toLowerCase();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://secure.payu.in/_payment";

    const fields = { key, txnid, amount, productinfo, firstname, email, phone, surl, furl, hash, udf1, udf2, udf3, udf4, udf5 };
    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const isHindi = lang === "hi";

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
              {isHindi ? "सिनेमा क्लब" : "SHORTSinSHORT CINEMA CLUB"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black mt-2 leading-tight">
              {isHindi ? "फ़िल्में मुफ़्त रहेंगी। सदस्यता से क्युरेशन को सम्बल मिलता है।" : "Films stay free. Membership supports our curation."}
            </h2>
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              {isHindi
                ? "₹5 प्रति सप्ताह (₹20 हर 4 सप्ताह) में हमारे स्वतंत्र संकलन, संपादकीय आलेख और सिनेप्रेमी समुदाय का हिस्सा बनें। हम यूट्यूब पर उपलब्ध किसी भी फ़िल्म के लिए कभी कोई शुल्क नहीं लेते।"
                : "For ₹5 a week, support SHORTSinSHORT independent curation, original editorial work and cinema community. We never charge for watching a YouTube film."}
            </p>
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {isHindi ? "सदस्यों को क्या मिलेगा:" : "What members receive:"}
            </h4>
            <ul className="text-xs text-zinc-400 space-y-2.5">
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✓</span>
                <span>{isHindi ? "क्यूरेटर का साप्ताहिक स्पेशल प्रोग्राम और मूल नोट्स" : "Curator’s Five, every week — A fresh five-film programme with an original curator note."}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✓</span>
                <span>{isHindi ? "मासिक ऑनलाइन सिनेमा रूम और सिने-चर्चा" : "Monthly Cinema Room — Members-only online conversation about short cinema and craft."}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">✓</span>
                <span>{isHindi ? "मेंबर जूरी — अगले थीम और स्पॉटलाइट पर वोट देने का अधिकार" : "Member Jury — Vote on the next theme, spotlight and community programme."}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="text-4xl font-black text-white">₹5</div>
            <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">{isHindi ? "प्रति सप्ताह" : "PER WEEK"}</div>
          </div>

          <button
            onClick={handlePayUCheckout}
            className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide transition shadow-lg cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>{isHindi ? "सिनेमा क्लब से जुड़ें — ₹5/सप्ताह" : "Join Cinema Club — ₹5/week"}</span>
          </button>

          <div className="space-y-2 text-[11px] text-zinc-500 text-center leading-relaxed">
            <p>
              {isHindi
                ? "PayU द्वारा सुरक्षित 256-बिट भुगतान। UPI, कार्ड्स और नेटबैंकिंग स्वीकार्य।"
                : "Secure 256-bit encrypted checkout via PayU. UPI, Cards & NetBanking accepted."}
            </p>
            <p>
              {isHindi
                ? "बिलिंग: ₹20 हर 4 सप्ताह में एक बार। किसी भी समय रद्द किया जा सकता है।"
                : "Billed as ₹20 every 4 weeks. Cancel anytime."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
