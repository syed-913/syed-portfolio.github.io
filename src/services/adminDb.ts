import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { adminDb as db } from '../lib/adminFirebase';
import type { BlogPost, Certificate, ContactMessage, Experience, Project, SiteSettings } from '../types/database';
import { siteDefaults } from '../data/siteDefaults';

const byOrder = <T extends { order?: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

const invalidatePublicCache = () => {
  try {
    sessionStorage.removeItem('portfolio:public-data:v11');
    sessionStorage.removeItem('portfolio:site-settings-render:v11');
  } catch { /* no-op */ }
};

export const getProjects = async (): Promise<Project[]> => {
  const snapshot = await getDocs(collection(db, 'projects'));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Project)));
};

export const getCertificates = async (): Promise<Certificate[]> => {
  const snapshot = await getDocs(collection(db, 'certificates'));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Certificate)));
};

export const getExperience = async (): Promise<Experience[]> => {
  const snapshot = await getDocs(collection(db, 'experience'));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Experience)));
};

export const getPosts = async (): Promise<BlogPost[]> => {
  const snapshot = await getDocs(query(collection(db, 'posts'), orderBy('date', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as BlogPost));
};

export const getMessages = async (): Promise<ContactMessage[]> => {
  const snapshot = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as ContactMessage));
};

export const getChatLogs = async (): Promise<any[]> => {
  const snapshot = await getDocs(collection(db, 'chatLogs'));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a: any, b: any) => String(b.timestamp ?? '').localeCompare(String(a.timestamp ?? '')));
};

export const addItem = async (collectionName: string, data: any) => {
  const result = await addDoc(collection(db, collectionName), data);
  invalidatePublicCache();
  return result;
};

export const updateItem = async (collectionName: string, id: string, data: any) => {
  await updateDoc(doc(db, collectionName, id), data);
  invalidatePublicCache();
};

export const deleteItem = async (collectionName: string, id: string) => {
  await deleteDoc(doc(db, collectionName, id));
  invalidatePublicCache();
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
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
};

export const saveSiteSettings = async (data: SiteSettings) => {
  await setDoc(doc(db, 'siteSettings', 'main'), data, { merge: true });
  invalidatePublicCache();
};
