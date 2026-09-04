import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const OWNER_EMAIL = (import.meta.env.VITE_OWNER_EMAIL || 'equaltales@gmail.com').toLowerCase();

const words = {
  en: {
    title: 'Your SHORTSinSHORT profile',
    intro: 'Create a free profile to join Cinema Club and receive programmes made for members. Every film remains free.',
    signIn: 'Continue with Google',
    signOut: 'Sign out',
    free: 'Free viewer',
    active: 'Cinema Club member',
    owner: 'Audience overview',
    registered: 'Registered profiles',
    members: 'Paid members',
    viewers: 'Free viewers',
    refresh: 'Refresh figures',
    setup: 'Profile sign-in is being connected. Please check again shortly.',
    retry: 'Could not load the figures. Please try again.',
  },
  hi: {
    title: 'आपकी SHORTSinSHORT प्रोफ़ाइल',
    intro: 'Cinema Club से जुड़ने और सदस्यों के लिए तैयार कार्यक्रम पाने के लिए मुफ़्त प्रोफ़ाइल बनाएं। हर फ़िल्म मुफ़्त रहेगी।',
    signIn: 'Google से आगे बढ़ें',
    signOut: 'साइन आउट',
    free: 'मुफ़्त दर्शक',
    active: 'Cinema Club सदस्य',
    owner: 'दर्शक स्थिति',
    registered: 'कुल प्रोफ़ाइल',
    members: 'पेड सदस्य',
    viewers: 'मुफ़्त दर्शक',
    refresh: 'आंकड़े रीफ़्रेश करें',
    setup: 'प्रोफ़ाइल साइन-इन जोड़ा जा रहा है। थोड़ी देर बाद फिर देखें।',
    retry: 'आंकड़े नहीं खुल सके। एक बार फिर कोशिश करें।',
  },
};

export default function ProfileModal({ lang, onClose }) {
  const text = words[lang === 'hi' ? 'hi' : 'en'];
  const { currentUser, profile, loading, loginWithGoogle, logout, isConfigured, isMember } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const isOwner = currentUser?.email?.toLowerCase() === OWNER_EMAIL;

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const handleLogin = async () => {
    setBusy(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (loginError) {
      if (loginError?.code !== 'auth/popup-closed-by-user') setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  const loadStats = async () => {
    if (!db || !isOwner) return;
    setBusy(true);
    setError('');
    try {
      const users = collection(db, 'users');
      const [allSnapshot, activeSnapshot, freeSnapshot] = await Promise.all([
        getCountFromServer(users),
        getCountFromServer(query(users, where('membershipStatus', '==', 'active'))),
        getCountFromServer(query(users, where('membershipStatus', '==', 'free'))),
      ]);
      setStats({
        registered: allSnapshot.data().count,
        active: activeSnapshot.data().count,
        free: freeSnapshot.data().count,
      });
    } catch (statsError) {
      console.error('Audience statistics failed:', statsError);
      setError(text.retry);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sis-profile-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="sis-profile-panel" role="dialog" aria-modal="true" aria-labelledby="sis-profile-title">
        <button className="sis-profile-close" type="button" onClick={onClose} aria-label="Close profile">×</button>

        <p className="sis-profile-kicker">SHORTSinSHORT</p>
        <h2 id="sis-profile-title">{text.title}</h2>

        {loading ? (
          <p className="sis-profile-muted">Loading…</p>
        ) : !isConfigured ? (
          <p className="sis-profile-notice">{text.setup}</p>
        ) : !currentUser ? (
          <>
            <p className="sis-profile-muted">{text.intro}</p>
            <button className="sis-profile-google" type="button" onClick={handleLogin} disabled={busy}>
              <span aria-hidden="true">G</span>{text.signIn}
            </button>
          </>
        ) : (
          <>
            <div className="sis-profile-identity">
              {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" referrerPolicy="no-referrer" /> : <span>{(currentUser.displayName || currentUser.email || 'S').charAt(0).toUpperCase()}</span>}
              <div>
                <strong>{currentUser.displayName || 'SHORTSinSHORT viewer'}</strong>
                <small>{currentUser.email}</small>
              </div>
            </div>
            <p className={`sis-profile-status ${isMember ? 'is-active' : ''}`}>● {isMember ? text.active : text.free}</p>

            {isOwner && (
              <div className="sis-profile-owner">
                <h3>{text.owner}</h3>
                {stats && (
                  <div className="sis-profile-stats">
                    <article><strong>{stats.registered}</strong><span>{text.registered}</span></article>
                    <article><strong>{stats.active}</strong><span>{text.members}</span></article>
                    <article><strong>{stats.free}</strong><span>{text.viewers}</span></article>
                  </div>
                )}
                <button type="button" onClick={loadStats} disabled={busy}>{text.refresh}</button>
              </div>
            )}

            <button className="sis-profile-signout" type="button" onClick={logout}>{text.signOut}</button>
          </>
        )}

        {error && <p className="sis-profile-error" role="alert">{error}</p>}
        {profile?.createdAt?.toDate && <small className="sis-profile-since">Member profile since {profile.createdAt.toDate().toLocaleDateString()}</small>}
      </section>
    </div>
  );
}
