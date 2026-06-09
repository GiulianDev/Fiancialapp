import { type User } from 'firebase/auth';

export type FirebaseUser = User;

export interface AuthContextType {
  user: FirebaseUser | null;
  authLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}