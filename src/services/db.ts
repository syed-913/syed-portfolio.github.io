import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  BlogPost,
  Certificate,
  ContactMessage,
  Experience,
  Project,
  SiteSettings,
} from '../types/database';
import { siteDefaults } from '../data/siteDefaults';

const byOrder = <T extends { order?: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

export const getProjects = async (): Promise<Project[]> => {
  const snapshot = await getDocs(collection(db, 'projects'));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Project)));
};

export const getPublicProjects = async (): Promise<Project[]> => {
  const q = query(collection(db, 'projects'), where('visible', '==', true));
  const snapshot = await getDocs(q);
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Project)));
};

export const getCertificates = async (): Promise<Certificate[]> => {
  const snapshot = await getDocs(collection(db, 'certificates'));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Certificate)));
};

export const getPublicCertificates = async (): Promise<Certificate[]> => {
  const all = await getCertificates();
  return all.filter((item) => item.visible !== false);
};

export const getExperience = async (): Promise<Experience[]> => {
  const snapshot = await getDocs(collection(db, 'experience'));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Experience)));
};

export const getPublicExperience = async (): Promise<Experience[]> => {
  const all = await getExperience();
  return all.filter((item) => item.visible !== false);
};

export const getPosts = async (): Promise<BlogPost[]> => {
  const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as BlogPost));
};

export const getPublicPosts = async (): Promise<BlogPost[]> => {
  const all = await getPosts();
  return all.filter((item) => item.visible !== false);
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
    await updateDoc(doc(db, 'posts', snapshot.docs[0].id), { upvotes: increment(1) });
  }
};

export const getMessages = async (): Promise<ContactMessage[]> => {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as ContactMessage));
};

export const getChatLogs = async (): Promise<any[]> => {
  const snapshot = await getDocs(collection(db, 'chatLogs'));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a: any, b: any) => String(b.timestamp ?? '').localeCompare(String(a.timestamp ?? '')));
};

export const addItem = async (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const updateItem = async (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteItem = async (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const snapshot = await getDoc(doc(db, 'siteSettings', 'main'));
    if (!snapshot.exists()) return siteDefaults;
    const remote = snapshot.data() as Partial<SiteSettings>;
    return {
      ...siteDefaults,
      ...remote,
      socials: { ...siteDefaults.socials, ...(remote.socials ?? {}) },
      seo: { ...siteDefaults.seo, ...(remote.seo ?? {}) },
      ui: { ...siteDefaults.ui, ...(remote.ui ?? {}) },
      capabilities: remote.capabilities?.length ? remote.capabilities : siteDefaults.capabilities,
    };
  } catch (error) {
    console.warn('Using local portfolio copy because siteSettings could not be read.', error);
    return siteDefaults;
  }
};

export const saveSiteSettings = async (data: SiteSettings) => {
  await setDoc(doc(db, 'siteSettings', 'main'), data, { merge: true });
};
