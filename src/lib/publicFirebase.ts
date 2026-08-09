import { getFirestore } from 'firebase/firestore/lite';
import app from './firebase';

export const publicDb = getFirestore(app);
