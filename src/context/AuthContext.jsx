import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
    isConfigured: isFirebaseConfigured,
    isMember: profile?.membershipStatus === 'active',
  }), [currentUser, profile, loading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
