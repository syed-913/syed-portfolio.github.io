export interface VisitStats {
  totalVisits: number;
  last7Days: { date: string; count: number }[];
  current7DaysTotal: number;
  previous7DaysTotal: number;
  trendPercent: number | null;
  topPaths: { path: string; count: number }[];
  trackedSessions: number;
  pagesPerSession: number;
  deviceBreakdown: { label: string; count: number; percent: number }[];
  sourceBreakdown: { label: string; count: number; percent: number }[];
  contactPageViews: number;
  peakDay: { date: string; count: number } | null;
}
