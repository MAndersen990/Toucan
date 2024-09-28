"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth, createUserWithEmailAndPassword, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface UserData {
  name: string
  watchlist: string[]
}

// Update the interface to include userData and refreshUserData
interface FirebaseContextType {
  user: User | null;
  userData: { name: string; watchlist: string[] } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserData: () => Promise<{ name: string; watchlist: string[] } | null>;
  refreshUserData: () => Promise<UserData | null>;
  addToWatchlist: (ticker: string) => Promise<void>;
  removeFromWatchlist: (ticker: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{ name: string; watchlist: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      if (authUser) {
        refreshUserData();
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Here you would typically also save the name and username to your user profile in the database
    // For example:
    await setDoc(doc(db, 'users', userCredential.user.uid), { name, username });
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    return userCredential.user;
  };
  
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      router.push('/');
    } catch (error) {
      console.error("Error during logout:", error)
    }
  };

  const getUserData = async () => {
    if (userData) {
      return userData;
    }
    return refreshUserData();
  }

  const refreshUserData = useCallback(async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserData
        setUserData(userData)
        return userData
      }
    }
    setUserData(null)
    return null
  }, [user])

  const addToWatchlist = async (ticker: string) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentData = userDoc.data();
        const updatedWatchlist = [...(currentData.watchlist || []), ticker];
        await setDoc(userRef, { ...currentData, watchlist: updatedWatchlist }, { merge: true });
        await refreshUserData(); // Refresh the cached user data
      }
    }
  }

  const removeFromWatchlist = async (ticker: string) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentData = userDoc.data();
        const updatedWatchlist = currentData.watchlist.filter((item: string) => item !== ticker);
        await setDoc(userRef, { ...currentData, watchlist: updatedWatchlist }, { merge: true });
        await refreshUserData(); // Refresh the cached user data
      }
    }
  }

  const value = {
    user,
    userData,
    loading,
    login,
    signUp,
    logout,
    getUserData,
    refreshUserData,
    addToWatchlist,
    removeFromWatchlist
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};