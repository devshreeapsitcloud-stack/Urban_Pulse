import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

export const authService = {
  // Subscribe to auth state
  subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Google Sign In
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await this.ensureUserProfile(result.user);
      return result.user;
    } catch (err) {
      console.error("Google Sign In Error:", err);
      throw err;
    }
  },

  // Email Sign Up
  async signUp(email: string, pass: string, name: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await this.ensureUserProfile(result.user, name);
      return result.user;
    } catch (err) {
      console.error("Sign Up Error:", err);
      throw err;
    }
  },

  // Email Sign In
  async signIn(email: string, pass: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (err) {
      console.error("Sign In Error:", err);
      throw err;
    }
  },

  // Sign Out
  async logout() {
    await signOut(auth);
  },

  // Ensure user profile exists in Firestore
  async ensureUserProfile(user: FirebaseUser, name?: string) {
    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        name: name || user.displayName || 'User',
        email: user.email || '',
        favorites: [],
        vehicle_number: '',
        theme: 'light'
      };
      await setDoc(userRef, profile);
    }
  },

  // Get User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, 'get', `${USERS_COLLECTION}/${uid}`);
    }
  },

  // Update User Profile
  async updateProfile(uid: string, data: Partial<UserProfile>) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userRef, data);
    } catch (err) {
      handleFirestoreError(err, 'update', `${USERS_COLLECTION}/${uid}`);
    }
  }
};
