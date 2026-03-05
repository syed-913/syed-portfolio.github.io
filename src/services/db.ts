
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    where,
    increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Project, Certificate, Experience, BlogPost } from '../types/database';

// --- Projects ---
export const getProjects = async (): Promise<Project[]> => {
    const q = query(collection(db, 'projects'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
};

export const getPublicProjects = async (): Promise<Project[]> => {
    const q = query(
        collection(db, 'projects'),
        where('visible', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
};

// --- Certificates ---
export const getCertificates = async (): Promise<Certificate[]> => {
    const q = query(collection(db, 'certificates'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
};

// --- Experience ---
export const getExperience = async (): Promise<Experience[]> => {
    const q = query(collection(db, 'experience'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience));
};

// --- Blog Posts ---
export const getPosts = async (): Promise<BlogPost[]> => {
    const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    const q = query(collection(db, 'posts'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;
};

export const incrementUpvote = async (slug: string): Promise<void> => {
    const q = query(collection(db, 'posts'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const docRef = doc(db, 'posts', snapshot.docs[0].id);
        await updateDoc(docRef, {
            upvotes: increment(1)
        });
    }
};

// --- Contact Messages ---
export const getMessages = async (): Promise<any[]> => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Generic Helpers (for Admin) ---
export const addItem = async (collectionName: string, data: any) => {
    return await addDoc(collection(db, collectionName), data);
};

export const updateItem = async (collectionName: string, id: string, data: any) => {
    const ref = doc(db, collectionName, id);
    return await updateDoc(ref, data);
};

export const deleteItem = async (collectionName: string, id: string) => {
    const ref = doc(db, collectionName, id);
    return await deleteDoc(ref);
};
