import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Visit { path:string; timestamp?:Timestamp|string|Date; userAgent?:string; sessionId?:string; referrer?:string; source?:string; }
export interface VisitStats {
  totalVisits:number; last7Days:{date:string;count:number}[]; current7DaysTotal:number; previous7DaysTotal:number; trendPercent:number|null;
  topPaths:{path:string;count:number}[]; trackedSessions:number; pagesPerSession:number;
  deviceBreakdown:{label:string;count:number;percent:number}[]; sourceBreakdown:{label:string;count:number;percent:number}[];
  contactPageViews:number; peakDay:{date:string;count:number}|null;
}
const emptyStats:VisitStats={totalVisits:0,last7Days:[],current7DaysTotal:0,previous7DaysTotal:0,trendPercent:null,topPaths:[],trackedSessions:0,pagesPerSession:0,deviceBreakdown:[],sourceBreakdown:[],contactPageViews:0,peakDay:null};
const sessionId=()=>{const k='portfolio:session-id',v=sessionStorage.getItem(k);if(v)return v;const id=crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;sessionStorage.setItem(k,id);return id;};
const sessionSource=()=>{const k='portfolio:session-source',v=sessionStorage.getItem(k);if(v)return v;let s='Direct';try{if(document.referrer){const r=new URL(document.referrer);if(r.origin!==location.origin){const h=r.hostname.replace(/^www\./,'').toLowerCase();s=h.includes('linkedin')?'LinkedIn':h.includes('google')?'Google':h.includes('github')?'GitHub':h.includes('bing')?'Bing':h;}}}catch{}sessionStorage.setItem(k,s);return s;};
const dateOf=(v:Visit)=>{const raw=v.timestamp as any;const d=raw?.toDate?raw.toDate():raw?new Date(raw):null;return d&&!Number.isNaN(d.getTime())?d:null;};
const device=(ua='')=>/ipad|tablet|kindle|silk/i.test(ua)?'Tablet':/mobi|iphone|android/i.test(ua)?'Mobile':'Desktop';
const rows=(m:Map<string,number>)=>{const total=[...m.values()].reduce((a,b)=>a+b,0);return [...m].map(([label,count])=>({label,count,percent:total?Math.round(count/total*100):0})).sort((a,b)=>b.count-a.count);};

export const logVisit=async(path:string)=>{try{const k=`visit:${path}`;if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');await addDoc(collection(db,'visits'),{path,timestamp:Timestamp.now(),userAgent:navigator.userAgent,sessionId:sessionId(),referrer:document.referrer||'',source:sessionSource()});}catch(e){console.warn('Visit analytics unavailable.',e);}};

export const getStats=async():Promise<VisitStats>=>{try{
  const snap=await getDocs(collection(db,'visits')), visits=snap.docs.map(d=>d.data() as Visit), today=new Date(); today.setHours(0,0,0,0);
  const dates=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-(6-i));return d.toISOString().slice(0,10)}), dayMap=new Map(dates.map(d=>[d,0])), pathMap=new Map<string,number>(), deviceMap=new Map<string,number>(), sessions=new Map<string,Visit[]>();
  const currentStart=new Date(today);currentStart.setDate(today.getDate()-6);const prevStart=new Date(today);prevStart.setDate(today.getDate()-13);const prevEnd=new Date(today);prevEnd.setDate(today.getDate()-7);prevEnd.setHours(23,59,59,999);let current=0,previous=0;
  visits.forEach(v=>{const d=dateOf(v);if(d){const key=d.toISOString().slice(0,10);if(dayMap.has(key))dayMap.set(key,(dayMap.get(key)||0)+1);if(d>=currentStart)current++;else if(d>=prevStart&&d<=prevEnd)previous++;}const p=v.path||'/';pathMap.set(p,(pathMap.get(p)||0)+1);const dev=device(v.userAgent);deviceMap.set(dev,(deviceMap.get(dev)||0)+1);if(v.sessionId){const arr=sessions.get(v.sessionId)||[];arr.push(v);sessions.set(v.sessionId,arr);}});
  const sourceMap=new Map<string,number>();sessions.forEach(vs=>{const s=vs.find(v=>v.source)?.source||'Unknown';sourceMap.set(s,(sourceMap.get(s)||0)+1)});const last7Days=dates.map(date=>({date,count:dayMap.get(date)||0}));const peakDay=last7Days.reduce<{date:string;count:number}|null>((a,b)=>!a||b.count>a.count?b:a,null);const tracked=[...sessions.values()].reduce((n,v)=>n+v.length,0);const trend=previous===0?(current>0?100:null):Math.round((current-previous)/previous*100);
  return {totalVisits:snap.size,last7Days,current7DaysTotal:current,previous7DaysTotal:previous,trendPercent:trend,topPaths:[...pathMap].map(([path,count])=>({path,count})).sort((a,b)=>b.count-a.count).slice(0,5),trackedSessions:sessions.size,pagesPerSession:sessions.size?Number((tracked/sessions.size).toFixed(1)):0,deviceBreakdown:rows(deviceMap),sourceBreakdown:rows(sourceMap).slice(0,5),contactPageViews:pathMap.get('/contact')||0,peakDay};
}catch(e){console.warn('Analytics stats unavailable.',e);return emptyStats;}};
