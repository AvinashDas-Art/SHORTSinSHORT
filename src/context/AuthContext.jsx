import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase';

const AuthContext = createContext(null);

async function syncUserProfile(user) {
  if (!db || !user) return null;

  const profileRef = doc(db, 'users', user.uid);
  const existing = await getDoc(profileRef);
  const identity = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    lastSeenAt: serverTimestamp(),
  };

  if (existing.exists()) {
    await setDoc(profileRef, identity, { merge: true });
  } else {
    await setDoc(profileRef, {
      ...identity,
      membershipStatus: 'free',
      createdAt: serverTimestamp(),
    });
  }

  const freshProfile = await getDoc(profileRef);
  return freshProfile.exists() ? freshProfile.data() : null;
}

export function AuthProvider({ children }) {
  const [membershipClock, setMembershipClock] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setMembershipClock(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthError('');
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setProfile(await syncUserProfile(user));
      } catch (error) {
        console.error('Profile sync failed:', error);
        setAuthError('Profile data could not be refreshed.');
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // Re-fetches this user's own profile doc on demand (no auth-state change
  // needed) - used after a PayU payment, so a tab that never navigated away
  // can notice the moment the webhook activates membership, just by
  // re-checking Firestore instead of waiting for a reload or re-login.
  const refreshProfile = useCallback(async () => {
    if (!db || !currentUser) return null;
    try {
      const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
      const data = snapshot.exists() ? snapshot.data() : null;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Profile refresh failed:', error);
      return null;
    }
  }, [currentUser]);

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Profile sign-in is not configured yet.');
    }
    setAuthError('');
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  const value = useMemo(() => ({
    currentUser,
    profile,
    loading,
    authError,
    loginWithGoogle,
    logout,
    refreshProfile,
    isConfigured: isFirebaseConfigured,
    isMember:
      currentUser?.email?.toLowerCase() === 'equaltales@gmail.com' ||
      (profile?.membershipStatus === 'active' &&
        profile?.membershipExpiresAt?.toMillis?.() > membershipClock),
  }), [currentUser, profile, loading, authError, membershipClock, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
