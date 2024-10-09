"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, signOut, User, sendPasswordResetEmail, updateProfile, updateEmail, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, createUserWithEmailAndPassword, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface UserData {
  name: string
  watchlist: string[]
  joinedDate: string
}

interface FirebaseContextType {
  user: User | null;
  userData: { name: string; watchlist: string[], joinedDate: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserData: () => Promise<UserData | null>;
  refreshUserData: () => Promise<UserData | null>;
  addToWatchlist: (ticker: string) => Promise<void>;
  removeFromWatchlist: (ticker: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (newName: string) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
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
  const [userData, setUserData] = useState<UserData | null>(null);
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        username,
        email,
        joinedDate: serverTimestamp()
      });
    } catch (error) {
      console.error("Error during signup:", error);
    }
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

  const getUserData = useCallback(async (): Promise<UserData | null> => {
    if (!user) return null;
    
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        return {
          name: data.name,
          watchlist: data.watchlist || [],
          joinedDate: data.joinedDate
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, [user]);

  const refreshUserData = useCallback(async () => {
    if (user) {
      const userData = await getUserData();
      setUserData(userData);
      return userData;
    }
    return null;
  }, [user]);

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

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  };

  const updateUserProfile = async (newName: string) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await updateProfile(currentUser, { displayName: newName });
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { name: newName }, { merge: true });
        await refreshUserData();
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }
    }
  };

  const updateUserEmail = async (newEmail: string, password: string) => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      try {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        await updateEmail(currentUser, newEmail);
        await refreshUserData();
      } catch (error) {
        console.error("Error updating user email:", error);
        throw error;
      }
    }
  };

  const deleteAccount = async (password: string) => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      try {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        
        // Delete user data from Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        await deleteDoc(userRef);
        
        // Delete the user account
        await deleteUser(currentUser);
        
        // Clear local user state
        setUser(null);
        setUserData(null);
        
        router.push('/');
      } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
      }
    }
  };

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
    removeFromWatchlist,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    deleteAccount,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};