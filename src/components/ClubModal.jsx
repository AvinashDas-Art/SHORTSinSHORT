import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const PAYU_LINK = "https://u.payu.in/PAYUMN/BrSLkzWRrctK";
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

function formatExpiry(expiresAt, lang) {
  const millis = expiresAt?.toMillis?.();
  if (!millis) return "";
  try {
    return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(millis));
  } catch (e) {
    return "";
  }
}

export default function ClubModal({ onClose, lang = "en" }) {
  const { currentUser, profile, isMember, loginWithGoogle, refreshProfile } = useAuth();
  const isHindi = lang === "hi";
  const [signingIn, setSigningIn] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Always call the latest refreshProfile without making it an effect
  // dependency - refreshProfile's identity changes whenever AuthProvider's
  // own state ticks (e.g. its once-a-minute membership clock), and if the
  // poll effect below depended on it directly, each such change would tear
  // down and restart the interval/timeout, same class of bug as the intro
  // animation's timer resetting on unrelated re-renders.
  const refreshRef = useRef(refreshProfile);
  useEffect(() => {
    refreshRef.current = refreshProfile;
  }, [refreshProfile]);

  // While a payment tab is open, quietly re-check membership whenever this
  // tab regains focus (or every few seconds as a fallback) - so the moment
  // PayU's webhook activates it server-side, this tab notices on its own.
  // No redirect back from PayU is needed: the SHORTSinSHORT tab never left
  // in the first place, it just stopped being the active tab for a minute.
  useEffect(() => {
    if (!awaitingPayment) return undefined;

    const check = () => { refreshRef.current?.(); };
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    const interval = window.setInterval(check, POLL_INTERVAL_MS);
    const timeout = window.setTimeout(() => setAwaitingPayment(false), POLL_TIMEOUT_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [awaitingPayment]);

  useEffect(() => {
    if (awaitingPayment && isMember) {
      setAwaitingPayment(false);
      setPaymentConfirmed(true);
    }
  }, [awaitingPayment, isMember]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      window.alert(
        isHindi
          ? "Google login पूरा नहीं हो सका। फिर कोशिश कीजिए।"
          : "Google sign-in could not be completed. Please try again."
      );
    } finally {
      setSigningIn(false);
    }
  };

  const handleCheckout = () => {
    const email = currentUser?.email?.trim().toLowerCase();
    if (!email) return;

    const message = isHindi
      ? `PayU पर भुगतान करते समय यही email लिखें:\n\n${email}\n\nअलग email लिखने पर membership अपने-आप activate नहीं होगी।`
      : `Use this exact email during PayU checkout:\n\n${email}\n\nMembership cannot activate automatically with a different email.`;

    if (!window.confirm(message)) return;

    // Open PayU in its own tab so this SHORTSinSHORT tab stays open and can
    // notice the moment membership activates, instead of navigating away and
    // depending on PayU redirecting back (its Payment Links product has no
    // merchant-configurable return URL to point back at our site).
    const paymentTab = window.open(PAYU_LINK, "_blank", "noopener,noreferrer");
    setPaymentConfirmed(false);
    setAwaitingPayment(true);

    if (!paymentTab) {
      // Popup blocked, or an in-app browser that can't open new tabs -
      // fall back to plain same-tab navigation so checkout still works.
      window.location.href = PAYU_LINK;
    }
  };

  const handleCheckNow = () => {
    refreshRef.current?.();
  };

  const expiryText = formatExpiry(profile?.membershipExpiresAt, lang);

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

          {isMember && (
            <div className="rounded-xl bg-green-950/40 border border-green-800/60 px-4 py-3 text-xs text-green-300 leading-relaxed">
              {isHindi
                ? `आपकी सदस्यता सक्रिय है${expiryText ? ` - ${expiryText} तक मान्य` : ""}।`
                : `Your membership is active${expiryText ? ` - valid through ${expiryText}` : ""}.`}
            </div>
          )}

          {paymentConfirmed && (
            <div className="rounded-xl bg-green-950/40 border border-green-800/60 px-4 py-3 text-xs text-green-300 leading-relaxed">
              {isHindi ? "भुगतान मिल गया - सदस्यता सक्रिय कर दी गयी है। धन्यवाद 🙏" : "Payment received - membership activated. Thank you!"}
            </div>
          )}

          {awaitingPayment ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-xs text-zinc-300 leading-relaxed">
                {isHindi
                  ? "भुगतान वाला टैब एक नयी विंडो में खुल गया है। भुगतान पूरा करने के बाद इसी टैब पर वापस आ जाइए - सदस्यता अपने-आप सक्रिय हो जाएगी।"
                  : "Payment opened in a new tab. Once you're done there, just come back to this tab - membership activates automatically."}
              </div>
              <button
                onClick={handleCheckNow}
                className="w-full py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs tracking-wide transition cursor-pointer"
              >
                {isHindi ? "मैंने भुगतान कर दिया है — अभी जांचें" : "I've paid — check now"}
              </button>
            </div>
          ) : !currentUser ? (
            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm tracking-wide transition shadow-lg cursor-pointer"
            >
              {signingIn
                ? (isHindi ? "साइन-इन हो रहा है..." : "Signing in...")
                : (isHindi ? "Google से साइन-इन करें" : "Sign in with Google")}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide transition shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>
                  {isMember
                    ? (isHindi ? "सदस्यता आगे बढ़ाएँ — ₹20" : "Extend membership — ₹20")
                    : (isHindi ? "क्लब को सपोर्ट करें — ₹20" : "Support the Club — ₹20")}
                </span>
              </button>
              <p className="text-[11px] text-zinc-500 text-center">
                {isHindi ? `साइन-इन: ${currentUser.email}` : `Signed in as ${currentUser.email}`}
              </p>
            </div>
          )}

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
