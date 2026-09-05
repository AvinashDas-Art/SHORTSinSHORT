import React from "react";

export default function ClubModal({ isOpen, onClose, lang = "en", currentUser, onLogin }) {
  if (!isOpen) return null;

  const handlePayUCheckout = async () => {
    const key = "C93YXO";
    const salt = "zDhUoiR5IDgshAVb40Owm0LAnvhpnwrp";
    const txnid = "TXN" + Date.now();
    const amount = "20.00";
    const productinfo = "SHORTSinSHORT_Club";
    const firstname = "Cinephile";
    const email = "member@shortsinshort.com";
    const phone = "9876543210";
    const surl = window.location.origin + "/?payment=success";
    const furl = window.location.origin + "/?payment=failed";

    // Standard sequence: key|txnid|amount|productinfo|firstname|email|||||||||||SALT
    const hashString = key + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + salt;

    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest("SHA-512", enc.encode(hashString));
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hash = hashArr.map(b => b.toString(16).padStart(2, "0")).join("").toLowerCase();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://secure.payu.in/_payment";

    const fields = {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      hash
    };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-white shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl p-2 cursor-pointer transition"
        >
          ✕
        </button>

        <div className="space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <span className="text-xs uppercase tracking-widest text-red-500 font-bold">
              {isHindi ? "सिनेमा क्लब" : "SHORTSinSHORT CINEMA CLUB"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black mt-1">
              {isHindi ? "फ़िल्में मुफ़्त रहेंगी। सदस्यता से क्युरेशन को सम्बल मिलता है।" : "Films stay free. Membership supports our curation."}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              {isHindi
                ? "₹5 प्रति सप्ताह (₹20 हर 4 सप्ताह) में हमारे स्वतंत्र संकलन, संपादकीय आलेख और सिनेप्रेमी समुदाय का हिस्सा बनें।"
                : "For ₹5 a week (₹20 billed 4-weekly), support SHORTSinSHORT independent curation, original editorial work and cinema community."}
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-center space-y-3">
            <div className="text-3xl sm:text-4xl font-black text-white">
              ₹5 <span className="text-sm font-normal text-zinc-400">{isHindi ? "/ सप्ताह" : "/ week"}</span>
            </div>
            <div className="text-xs text-zinc-400">
              {isHindi ? "बिलिंग: ₹20 हर 4 सप्ताह में एक बार" : "Billed as ₹20 every 4 weeks"}
            </div>

            <button
              onClick={handlePayUCheckout}
              className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide transition shadow-lg cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{isHindi ? "सिनेमा क्लब से जुड़ें — ₹5/सप्ताह" : "Join Cinema Club — ₹5/week"}</span>
            </button>

            <p className="text-[11px] text-zinc-400">
              {isHindi
                ? "PayU द्वारा सुरक्षित 256-बिट भुगतान। UPI, कार्ड्स और नेटबैंकिंग स्वीकार्य।"
                : "Secure 256-bit encrypted checkout via PayU. UPI, Cards & NetBanking accepted."}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {isHindi ? "सदस्यों को क्या मिलेगा:" : "What members receive:"}
            </h4>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
              <li>{isHindi ? "क्यूरेटर का साप्ताहिक स्पेशल बुलेटिन और फिल्म नोट्स" : "Curator’s weekly special dispatch & film notes"}</li>
              <li>{isHindi ? "ओरिजिनल शूटिंग स्क्रिप्ट्स और स्टडी आर्काइव तक एक्सेस" : "Access to shooting script drafts & study vault"}</li>
              <li>{isHindi ? "सिनेमा क्लब की ऑनलाइन चर्चाओं और पोल में भागीदारी" : "Community discussion rooms and monthly jury voting"}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
