
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { User, UserStatus, UserRole } from '../types';

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

export const createUserProfile = async (uid: string, email: string) => {
  const path = `users/${uid}`;
  try {
    // Check if Arshad is the creator for bootstrap admin
    const isAdmin = email.toLowerCase() === 'arshad2097@gmail.com';
    const newUser: Omit<User, 'id'> = {
      email,
      role: isAdmin ? 'ADMIN' : 'USER',
      status: isAdmin ? 'APPROVED' : 'PENDING',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', uid), newUser);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const subscribeToAllUsers = (callback: (users: User[]) => void) => {
  const path = 'users';
  return onSnapshot(collection(db, path), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const updateUserStatus = async (uid: string, status: UserStatus) => {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const updateGlobalConfig = async (signupEnabled: boolean) => {
  const path = 'config/global';
  try {
    await setDoc(doc(db, path), { signupEnabled }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getGlobalConfig = (callback: (config: { signupEnabled: boolean }) => void) => {
  const path = 'config/global';
  return onSnapshot(doc(db, path), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as { signupEnabled: boolean });
    } else {
      callback({ signupEnabled: true });
    }
  }, (error) => {
    console.warn("Global config not found or inaccessible:", error);
    callback({ signupEnabled: true }); // Default to true if inaccessible
  });
};
