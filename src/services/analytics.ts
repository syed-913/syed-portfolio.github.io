
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Visit {
    path: string;
    timestamp: Timestamp;
    userAgent: string;
}

export const logVisit = async (path: string) => {
    try {
        // Simple visitor tracking (anon)
        await addDoc(collection(db, 'visits'), {
            path,
            timestamp: Timestamp.now(),
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error("Failed to log visit:", error);
    }
};

export const getStats = async () => {
    try {
        // In a real app, we'd use server-side aggregation or counters
        // For this portfolio, fetching all visits might eventually be slow but fine for now
        const snapshot = await getDocs(collection(db, 'visits'));
        return {
            totalVisits: snapshot.size,
            // We could add more stats here (unique visitors, page breakdown)
        };
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        return { totalVisits: 0 };
    }
};
