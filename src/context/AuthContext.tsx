import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, SUPER_ADMIN_EMAIL, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserPaymentNumbers } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    email: string,
    pass: string,
    name: string,
    phone: string,
    refCode?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserContact: (name: string, phone: string, paymentNumbers: UserPaymentNumbers) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Real-time listener on user profile doc
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              setProfile(snapshot.data() as UserProfile);
            } else {
              // Self-heal profile if user exists in Auth but not Firestore
              const isSuper = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
              const initialProfile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                role: isSuper ? 'admin' : 'user',
                walletBalance: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                pendingWithdrawals: 0,
                referralCode: 'APX' + Math.random().toString(36).substring(2, 7).toUpperCase(),
                phone: '',
                status: 'active',
                createdAt: new Date().toISOString(),
              };

              try {
                await setDoc(userDocRef, initialProfile);
                if (isSuper) {
                  await setDoc(doc(db, 'admins', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    role: 'superadmin',
                    createdAt: new Date().toISOString(),
                  });
                }
                setProfile(initialProfile);
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
              }
            }
            setLoading(false);
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const register = async (
    email: string,
    pass: string,
    name: string,
    phone: string,
    refCode?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = cred.user;
    await updateProfile(user, { displayName: name.trim() });

    const isSuper = email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const newRefCode = 'APX' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const newUserProfile: UserProfile = {
      uid: user.uid,
      email: email.trim(),
      displayName: name.trim(),
      role: isSuper ? 'admin' : 'user',
      walletBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      pendingWithdrawals: 0,
      referralCode: newRefCode,
      referredBy: refCode?.trim() || '',
      phone: phone.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, newUserProfile);

    // If super admin email, create admin record
    if (isSuper) {
      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email: email.trim(),
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      });
    }

    // Process referral linkage if referral code provided
    if (refCode && refCode.trim()) {
      try {
        const refQuery = query(
          collection(db, 'users'),
          where('referralCode', '==', refCode.trim().toUpperCase())
        );
        const refSnap = await getDocs(refQuery);
        if (!refSnap.empty) {
          const referrerDoc = refSnap.docs[0];
          const referrerData = referrerDoc.data() as UserProfile;

          // Record in referrals collection
          const refDocId = `ref_${referrerData.uid}_${user.uid}`;
          await setDoc(doc(db, 'referrals', refDocId), {
            id: refDocId,
            referrerId: referrerData.uid,
            referredUserId: user.uid,
            referredEmail: email.trim(),
            referredName: name.trim(),
            bonusEarned: 0,
            status: 'registered',
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Referral check non-fatal error:', err);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const updateUserContact = async (
    name: string,
    phone: string,
    paymentNumbers: UserPaymentNumbers
  ) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(
      userDocRef,
      {
        displayName: name.trim(),
        phone: phone.trim(),
        paymentNumbers,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const isAdmin = Boolean(
    currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
    profile?.role === 'admin'
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isAdmin,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateUserContact,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
