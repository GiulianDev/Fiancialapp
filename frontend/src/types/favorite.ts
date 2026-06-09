import type { Timestamp } from 'firebase/firestore';

export interface Favorite {
  id?: string;
  userId: string;
  isin: string;
  name?: string;
  createdAt?: Timestamp;
}
