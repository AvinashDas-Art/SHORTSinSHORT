import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, loginWithGoogle, logoutUser } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('is_premium_member') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const savedStatus = localStorage.getItem(`premium_${user.uid}`);
        if (savedStatus === 'true') {
          setIsPremium(true);
        }
      } else {
        setIsPremium(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const activatePremium = () => {
    setIsPremium(true);
    localStorage.setItem('is_premium_member', 'true');
    if (currentUser) {
      localStorage.setItem(`premium_${currentUser.uid}`, 'true');
    }
  };

  const value = {
    currentUser,
    loginWithGoogle,
    logout: async () => {
      await logoutUser();
      setIsPremium(false);
      localStorage.removeItem('is_premium_member');
    },
    isPremium,
    activatePremium
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
