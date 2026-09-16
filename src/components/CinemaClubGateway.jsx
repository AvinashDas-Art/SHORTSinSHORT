import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PAYU_LINK = 'https://u.payu.in/PAYUMN/BrSLkzWRrctK';
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

const copy = {
  en: {
    eyebrow: 'A NOTE BEFORE THE FILM',
    title: 'Films stay free. Curation needs patrons.',
    body: 'This is not a ticket for this film. Every film on SHORTSinSHORT remains free to watch. Your ₹20 contribution supports the research, verification, language curation and care that keep this independent cinematheque alive.',
    support: 'Join Cinema Club - ₹20 / 4 weeks',
    signIn: 'Continue with Google',
    signingIn: 'Opening Google sign-in…',
    watch: 'Watch film - Free',
    optional: 'Membership is optional. The film opens either way.',
    signedIn: 'PayU email must match',
    paymentOpen: 'PayU has opened in a new tab. Return here after payment - membership will activate automatically.',
    check: 'Check membership now',
    error: 'Google sign-in could not be completed. Please try again.',
  },
  hi: {
    eyebrow: 'फ़िल्म से पहले एक छोटी-सी बात',
    title: 'फ़िल्में मुफ़्त रहेंगी। क्यूरेशन को आपके साथ की ज़रूरत है।',
    body: 'यह इस फ़िल्म का टिकट नहीं है। SHORTSinSHORT पर हर फ़िल्म मुफ़्त है। आपका ₹20 का सहयोग शोध, सत्यापन, भाषाई क्यूरेशन और इस स्वतंत्र सिनेमा मंच को चलाने वाली मेहनत में साथ देता है।',
    support: 'सिनेमा क्लब से जुड़ें - ₹20 / 4 सप्ताह',
    signIn: 'Google से आगे बढ़ें',
    signingIn: 'Google sign-in खुल रहा है…',
    watch: 'फ़िल्म देखें - मुफ़्त',
    optional: 'Membership वैकल्पिक है। फ़िल्म हर हाल में खुलेगी।',
    signedIn: 'PayU email यही होना चाहिए',
    paymentOpen: 'PayU नये टैब में खुल गया है। भुगतान के बाद यहां लौटें - membership अपने-आप सक्रिय हो जाएगी।',
    check: 'Membership अभी जांचें',
    error: 'Google sign-in पूरा नहीं हो सका। फिर कोशिश कीजिए।',
  },
};

export default function CinemaClubGateway({ film, lang = 'en', setLang, onContinue }) {
  const { currentUser, isMember, loginWithGoogle, refreshProfile } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const [error, setError] = useState('');
  const refreshRef = useRef(refreshProfile);
  const text = copy[lang] || copy.en;

  useEffect(() => {
    refreshRef.current = refreshProfile;
  }, [refreshProfile]);

  useEffect(() => {
    if (!awaitingPayment) return undefined;
    const check = () => refreshRef.current?.();
    const onVisible = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);
    const interval = window.setInterval(check, POLL_INTERVAL_MS);
    const timeout = window.setTimeout(() => setAwaitingPayment(false), POLL_TIMEOUT_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [awaitingPayment]);

  useEffect(() => {
    if (isMember) onContinue();
  }, [isMember, onContinue]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (signInError) {
      console.error('Gateway sign-in failed:', signInError);
      setError(text.error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleCheckout = () => {
    const email = currentUser?.email?.trim().toLowerCase();
    if (!email) return;
    const message = lang === 'hi'
      ? `PayU पर भुगतान करते समय यही email लिखें:\n\n${email}\n\nअलग email लिखने पर membership अपने-आप सक्रिय नहीं होगी।`
      : `Use this exact email during PayU checkout:\n\n${email}\n\nMembership cannot activate automatically with a different email.`;
    if (!window.confirm(message)) return;
    const paymentTab = window.open(PAYU_LINK, '_blank', 'noopener,noreferrer');
    setAwaitingPayment(true);
    if (!paymentTab) window.location.href = PAYU_LINK;
  };

  const videoId = film?.youtubeVideoId || film?.id;
  const artwork = film?.backdrop || film?.thumbnail || film?.thumbnailUrl ||
    (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '');

  return (
    <section
      className="sis3-gateway"
      lang={lang}
      data-lang={lang}
      aria-label={text.eyebrow}
      style={artwork ? { '--gateway-art': `url("${artwork}")` } : undefined}
    >
      <div className="sis3-gateway-art" aria-hidden="true" />
      <div className="sis3-gateway-scrim" aria-hidden="true" />

      <div className="sis3-gateway-language" aria-label="Language">
        <button type="button" className={lang === 'en' ? 'is-active' : ''} onClick={() => setLang?.('en')}>EN</button>
        <button type="button" className={lang === 'hi' ? 'is-active' : ''} onClick={() => setLang?.('hi')}>हिंदी</button>
      </div>

      <div className="sis3-gateway-card">
        <div className="sis3-gateway-mark" aria-hidden="true"><i /><i /><i /></div>
        <p className="sis3-gateway-eyebrow">{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p className="sis3-gateway-body">{text.body}</p>

        <div className="sis3-gateway-actions">
          {!currentUser ? (
            <button type="button" className="sis3-gateway-support" onClick={handleSignIn} disabled={signingIn}>
              <span className="sis3-google-g">G</span>
              {signingIn ? text.signingIn : text.signIn}
            </button>
          ) : (
            <button type="button" className="sis3-gateway-support" onClick={handleCheckout}>
              {text.support}
            </button>
          )}
          <button type="button" className="sis3-gateway-watch" onClick={onContinue}>
            <span aria-hidden="true">▶</span> {text.watch}
          </button>
        </div>

        {currentUser && !awaitingPayment && (
          <p className="sis3-gateway-email">{text.signedIn}: <strong>{currentUser.email}</strong></p>
        )}
        {awaitingPayment && (
          <div className="sis3-gateway-payment">
            <p>{text.paymentOpen}</p>
            <button type="button" onClick={() => refreshRef.current?.()}>{text.check}</button>
          </div>
        )}
        {error && <p className="sis3-gateway-error" role="alert">{error}</p>}
        <p className="sis3-gateway-optional">{text.optional}</p>
      </div>

      <p className="sis3-gateway-signature">SHORTSinSHORT <span>·</span> INDEPENDENT CINEMATHEQUE</p>
    </section>
  );
}
