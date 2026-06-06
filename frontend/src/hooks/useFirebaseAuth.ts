import { useEffect, useState } from 'react';
import { signInWithGoogle, logout, onAuthStateChangedListener, type FirebaseUser } from '../firebase';

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await logout();
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    authLoading,
    signIn,
    signOut,
  };
}
