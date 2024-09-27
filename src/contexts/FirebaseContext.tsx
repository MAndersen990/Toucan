"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
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
  const router = useRouter()

  useEffect(() => {
    console.log(user)
    const unsubscribe = auth.onAuthStateChanged(setUser);
    console.log("logged in user", user);
    if (!user) {
        router.push('/')
    }
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Here you would typically also save the name and username to your user profile in the database
    // For example:
    await setDoc(doc(db, 'users', userCredential.user.uid), { name, username });
  };

  const logout = async (): Promise<void> => {
    try {
      await auth.signOut()
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
    signUp,
    logout,
    getUserData
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};