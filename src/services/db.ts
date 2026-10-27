import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from 'firebase/firestore/lite';
import { publicDb as db } from '../lib/publicFirebase';
import type { BlogPost, Certificate, Experience, Project, SiteSettings } from '../types/database';
import { siteDefaults } from '../data/siteDefaults';
import { normalizeHeroCanvas } from '../lib/heroCanvas';
import { PublicReadCache } from '../lib/publicReadCache';

const publicCache = new PublicReadCache();
const withCache = <T,>(key: string, loader: () => Promise<T>, ttl?: number) => publicCache.get(key, loader, ttl);
export const invalidatePublicCache = (prefix?: string) => publicCache.invalidate(prefix);

const byOrder = <T extends { order?: number }>(items: T[]) =>
  [...items].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

const containsImplementationDetail = (value?: string) => /firebase|cloudflare|webhook|discord webhook|backend|database collection|private dashboard/i.test(value ?? '');

const sanitizePublicSettings = (settings: SiteSettings): SiteSettings => ({
  ...settings,
  heroCanvas: normalizeHeroCanvas(settings.heroCanvas),
  aboutBody: /(?:about\s+)?(?:~?\s*)?(?:1|one)\s+year.*professional experience/i.test(settings.aboutBody) ? siteDefaults.aboutBody : settings.aboutBody,
  contactIntro: containsImplementationDetail(settings.contactIntro) ? siteDefaults.contactIntro : settings.contactIntro,
  ui: {
    ...settings.ui,
    projectEmptyTitle: containsImplementationDetail(settings.ui.projectEmptyTitle) ? siteDefaults.ui.projectEmptyTitle : settings.ui.projectEmptyTitle,
    projectEmptyBody: containsImplementationDetail(settings.ui.projectEmptyBody) ? siteDefaults.ui.projectEmptyBody : settings.ui.projectEmptyBody,
    signalsNote: containsImplementationDetail(settings.ui.signalsNote) ? siteDefaults.ui.signalsNote : settings.ui.signalsNote,
    experienceEmptyTitle: containsImplementationDetail(settings.ui.experienceEmptyTitle) ? siteDefaults.ui.experienceEmptyTitle : settings.ui.experienceEmptyTitle,
    experienceEmptyBody: containsImplementationDetail(settings.ui.experienceEmptyBody) ? siteDefaults.ui.experienceEmptyBody : settings.ui.experienceEmptyBody,
    contactPrivacy: containsImplementationDetail(settings.ui.contactPrivacy) ? siteDefaults.ui.contactPrivacy : settings.ui.contactPrivacy,
  },
});

export const getPublicProjects = () => withCache<Project[]>('projects', async () => {
  const snapshot = await getDocs(query(collection(db, 'projects'), where('visible', '==', true)));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Project)));
});

export const getPublicCertificates = () => withCache<Certificate[]>('certificates', async () => {
  const snapshot = await getDocs(query(collection(db, 'certificates'), where('visible', '==', true)));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Certificate)));
});

export const getPublicExperience = () => withCache<Experience[]>('experience', async () => {
  const snapshot = await getDocs(query(collection(db, 'experience'), where('visible', '==', true)));
  return byOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Experience)));
});

export const getPublicPosts = () => withCache<BlogPost[]>('posts', async () => {
  const snapshot = await getDocs(query(collection(db, 'posts'), where('visible', '==', true)));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() } as BlogPost))
    .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
});

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const cachedPosts = publicCache.read<BlogPost[]>('posts');
  const cachedPost = cachedPosts?.find((item) => item.slug === slug);
  if (cachedPost) return cachedPost;

  const snapshot = await getDocs(query(collection(db, 'posts'), where('slug', '==', slug), where('visible', '==', true)));
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;
};

export const incrementUpvote = async (slug: string): Promise<void> => {
  const snapshot = await getDocs(query(collection(db, 'posts'), where('slug', '==', slug), where('visible', '==', true)));
  if (!snapshot.empty) {
    await updateDoc(doc(db, 'posts', snapshot.docs[0].id), { upvotes: increment(1) });
    invalidatePublicCache('posts');
  }
};

// Narrow public writes used by contact, visit analytics and the assistant log.
// Firestore Security Rules remain the authorization boundary.
export const addItem = async (collectionName: string, data: Record<string, unknown>) =>
  addDoc(collection(db, collectionName), data);

export const getSiteSettings = async ({ strict = false }: { strict?: boolean } = {}): Promise<SiteSettings> => {
  try {
    return await withCache<SiteSettings>('settings', async () => {
      const snapshot = await getDoc(doc(db, 'siteSettings', 'main'));
      if (!snapshot.exists()) return siteDefaults;
      const remote = snapshot.data() as Partial<SiteSettings>;
      return sanitizePublicSettings({
        ...siteDefaults,
        ...remote,
        socials: { ...siteDefaults.socials, ...(remote.socials ?? {}) },
        seo: { ...siteDefaults.seo, ...(remote.seo ?? {}) },
        ui: { ...siteDefaults.ui, ...(remote.ui ?? {}) },
        capabilities: remote.capabilities?.length ? remote.capabilities : siteDefaults.capabilities,
      });
    }, 10 * 60 * 1000);
  } catch (error) {
    if (strict) throw error;
    console.warn('Using local portfolio copy because siteSettings could not be read.', error);
    return siteDefaults;
  }
};
