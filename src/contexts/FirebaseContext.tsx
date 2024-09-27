"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { signOut, User } from 'firebase/auth';
import { auth, createUserWithEmailAndPassword, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface FirebaseContextType {
  user: User | null;
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);

      if (authUser) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signUp = async (email: string, password: string, name: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Here you would typically also save the name and username to your user profile in the database
    // For example:
    await setDoc(doc(db, 'users', userCredential.user.uid), { name, username });
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  };

  const getUserData = async () => {
    const user = auth.currentUser
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      return userDoc.data()
    }
  }
  const value = {
    user,
    loading,
    signUp,
    logout,
    getUserData
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};