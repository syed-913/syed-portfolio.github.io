import type { Experience } from '../types/database';

const monthNames: Record<string, number> = {
  jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,
  jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11,
};

const toMonthIndex = (date?: string) => {
  if (!date) return null;
  const iso = /^(\d{4})-(\d{2})/.exec(date.trim());
  if (iso) return Number(iso[1]) * 12 + Number(iso[2]) - 1;
  const text = date.trim().toLowerCase();
  if (/present|current|now/.test(text)) {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  const named = /([a-z]+)\s+(\d{4})/.exec(text);
  if (named && monthNames[named[1]] !== undefined) return Number(named[2]) * 12 + monthNames[named[1]];
  const year = /(19|20)\d{2}/.exec(text);
  return year ? Number(year[0]) * 12 : null;
};

const parseDuration = (duration?: string) => {
  if (!duration) return null;
  const parts = duration.split(/\s+(?:—|–|-)\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const start = toMonthIndex(parts[0]);
  const end = toMonthIndex(parts[1]);
  return start !== null && end !== null && end >= start ? { start, end } : null;
};

export const experienceRange = (item: Experience) => {
  const start = toMonthIndex(item.startDate);
  const end = item.startDate ? (toMonthIndex(item.endDate || 'Present')) : null;
  if (start !== null && end !== null && end >= start) return { start, end };
  return parseDuration(item.duration);
};

export const totalProfessionalMonths = (items: Experience[]) => {
  const months = new Set<number>();
  items.filter((item) => item.visible !== false).forEach((item) => {
    const range = experienceRange(item);
    if (!range) return;
    for (let m = range.start; m <= range.end; m += 1) months.add(m);
  });
  return months.size;
};

export const formatProfessionalExperience = (items: Experience[]) => {
  const total = totalProfessionalMonths(items);
  if (!total) return 'Timeline available below';
  const years = Math.floor(total / 12);
  const months = total % 12;
  if (!years) return `${months} month${months === 1 ? '' : 's'}`;
  if (!months) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} yr ${months} mo`;
};

export const displayExperienceDuration = (item: Experience) => {
  if (item.duration?.trim()) return item.duration;
  if (!item.startDate) return '';
  const pretty = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, Math.max(0, month - 1), 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };
  return `${pretty(item.startDate)} — ${item.endDate ? pretty(item.endDate) : 'Present'}`;
};
