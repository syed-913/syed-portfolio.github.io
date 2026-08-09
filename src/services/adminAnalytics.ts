import { collection, getDocs, type Timestamp } from 'firebase/firestore';
import { adminDb as db } from '../lib/adminFirebase';
import type { VisitStats } from '../types/analytics';
export type { VisitStats } from '../types/analytics';

interface Visit { path: string; timestamp?: Timestamp | string | Date; userAgent?: string; sessionId?: string; referrer?: string; source?: string; }

const emptyStats: VisitStats = { totalVisits:0,last7Days:[],current7DaysTotal:0,previous7DaysTotal:0,trendPercent:null,topPaths:[],trackedSessions:0,pagesPerSession:0,deviceBreakdown:[],sourceBreakdown:[],contactPageViews:0,peakDay:null };
const dateOf = (visit: Visit) => { const raw = visit.timestamp as any; const date = raw?.toDate ? raw.toDate() : raw ? new Date(raw) : null; return date && !Number.isNaN(date.getTime()) ? date : null; };
const device = (ua = '') => /ipad|tablet|kindle|silk/i.test(ua) ? 'Tablet' : /mobi|iphone|android/i.test(ua) ? 'Mobile' : 'Desktop';
const rows = (map: Map<string,number>) => { const total=[...map.values()].reduce((a,b)=>a+b,0); return [...map].map(([label,count])=>({label,count,percent:total?Math.round(count/total*100):0})).sort((a,b)=>b.count-a.count); };

export const getStats = async (): Promise<VisitStats> => {
  try {
    const snapshot = await getDocs(collection(db, 'visits'));
    const visits = snapshot.docs.map((item) => item.data() as Visit);
    const today = new Date(); today.setHours(0,0,0,0);
    const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(today); date.setDate(today.getDate() - (6 - index)); return date.toISOString().slice(0, 10); });
    const dayMap = new Map(dates.map((date) => [date, 0]));
    const pathMap = new Map<string,number>();
    const deviceMap = new Map<string,number>();
    const sessions = new Map<string,Visit[]>();
    const currentStart = new Date(today); currentStart.setDate(today.getDate() - 6);
    const previousStart = new Date(today); previousStart.setDate(today.getDate() - 13);
    const previousEnd = new Date(today); previousEnd.setDate(today.getDate() - 7); previousEnd.setHours(23,59,59,999);
    let current = 0; let previous = 0;

    visits.forEach((visit) => {
      const date = dateOf(visit);
      if (date) {
        const key = date.toISOString().slice(0,10);
        if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1);
        if (date >= currentStart) current += 1;
        else if (date >= previousStart && date <= previousEnd) previous += 1;
      }
      const path = visit.path || '/'; pathMap.set(path, (pathMap.get(path) || 0) + 1);
      const visitorDevice = device(visit.userAgent); deviceMap.set(visitorDevice, (deviceMap.get(visitorDevice) || 0) + 1);
      if (visit.sessionId) { const entries = sessions.get(visit.sessionId) || []; entries.push(visit); sessions.set(visit.sessionId, entries); }
    });

    const sourceMap = new Map<string,number>();
    sessions.forEach((entries) => { const source = entries.find((entry) => entry.source)?.source || 'Unknown'; sourceMap.set(source, (sourceMap.get(source) || 0) + 1); });
    const last7Days = dates.map((date) => ({ date, count: dayMap.get(date) || 0 }));
    const peakDay = last7Days.reduce<{date:string;count:number}|null>((best,item) => !best || item.count > best.count ? item : best, null);
    const tracked = [...sessions.values()].reduce((total, entries) => total + entries.length, 0);
    const trend = previous === 0 ? (current > 0 ? 100 : null) : Math.round((current - previous) / previous * 100);

    return {
      totalVisits: snapshot.size,
      last7Days,
      current7DaysTotal: current,
      previous7DaysTotal: previous,
      trendPercent: trend,
      topPaths: [...pathMap].map(([path,count])=>({path,count})).sort((a,b)=>b.count-a.count).slice(0,5),
      trackedSessions: sessions.size,
      pagesPerSession: sessions.size ? Number((tracked / sessions.size).toFixed(1)) : 0,
      deviceBreakdown: rows(deviceMap),
      sourceBreakdown: rows(sourceMap).slice(0,5),
      contactPageViews: pathMap.get('/contact') || 0,
      peakDay,
    };
  } catch (error) {
    console.warn('Analytics stats unavailable.', error);
    return emptyStats;
  }
};
