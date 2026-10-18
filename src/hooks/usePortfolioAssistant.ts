import { useEffect, useRef, useState } from 'react';
import { addItem, getPublicCertificates, getPublicExperience, getPublicPosts, getPublicProjects } from '../services/db';
import { useSiteSettings } from './useSiteSettings';

export type AssistantMode = 'NORMAL' | 'RECRUITER';
export type AssistantMessage = { id: string; role: 'user' | 'model'; text: string; failedQuery?: string };
export const ASSISTANT_DAILY_LIMIT = 15;
const RATE_LIMIT_KEY = 'chatbot_usage';
const todayKey = () => new Date().toISOString().slice(0, 10);
const readUsage = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || 'null');
    return parsed?.date === todayKey() && Number.isFinite(parsed.count) ? Math.max(0, parsed.count as number) : 0;
  } catch { return 0; }
};
const remainingQuestions = () => Math.max(0, ASSISTANT_DAILY_LIMIT - readUsage());
const recordUse = () => { try { localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: todayKey(), count: readUsage() + 1 })); } catch { /* Storage may be unavailable. */ } };
const prompts: Record<AssistantMode, string> = {
  NORMAL: 'You are the portfolio assistant for the person described in the authoritative portfolio data below. Help visitors understand only what is evidenced in the current portfolio data supplied below. System administration is a foundation, while infrastructure, cloud, automation, Kubernetes and reliability are valid directions when supported by the data. Never invent skills, dates, employers, projects or seniority. Clearly distinguish professional experience from labs, projects, certifications and formal education. Be warm, concise and specific.',
  RECRUITER: 'You are the portfolio assistant for recruiters and hiring managers evaluating the person described in the authoritative portfolio data below. Use only the current portfolio data supplied below. Summarize evidence relevant to infrastructure, Linux system administration, DevOps, cloud, Kubernetes-adjacent and SRE-oriented opportunities without inflating seniority. Separate professional experience from labs, projects, certifications and formal education. If evidence is missing, say so. Encourage a direct conversation when there is a plausible role fit.',
};

export const usePortfolioAssistant = (open: boolean) => {
  const { settings } = useSiteSettings();
  const [mode, setMode] = useState<AssistantMode>('NORMAL');
  const [messages, setMessages] = useState<AssistantMessage[]>([{ id: 'welcome', role: 'model', text: 'Hi — I can help you find the relevant parts of this portfolio without making you hunt through every page.' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [remaining, setRemaining] = useState(remainingQuestions);
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  const context = useRef('');
  const contextLoaded = useRef(false);
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const sequence = useRef(0);
  const pending = useRef(false);
  const nextId = () => `message-${++sequence.current}`;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current?.abort(); }; }, []);
  useEffect(() => { if (open) setRemaining(remainingQuestions()); }, [open]);
  useEffect(() => {
    if (!open || contextLoaded.current) return;
    const timer = window.setTimeout(() => {
      contextLoaded.current = true;
      Promise.all([getPublicProjects().catch(() => []), getPublicExperience().catch(() => []), getPublicCertificates().catch(() => []), getPublicPosts().catch(() => [])])
        .then(([projects, experience, certificates, posts]) => {
          context.current = JSON.stringify({
            profile: { name: settings.name, location: settings.location, availability: settings.availability, positioning: settings.heroBody, profile: settings.aboutBody, currentFocus: settings.currentFocus, capabilities: settings.capabilities },
            professionalExperience: experience.map(({ role, company, duration, startDate, endDate, description, techStack }) => ({ role, company, duration, startDate, endDate, description, techStack })),
            projects: projects.map(({ name, description, command, url, problem, built, decisions, outcome, learnings, stack }) => ({ name, description, command, url, problem, built, decisions, outcome, learnings, stack })),
            credentials: certificates.filter(item => item.entryType !== 'education').map(({ name, issuer, date, category, credentialId }) => ({ name, issuer, date, category, credentialId })),
            education: certificates.filter(item => item.entryType === 'education').map(({ name, institution, field, startDate, endDate, educationStatus, details }) => ({ name, institution, field, startDate, endDate, educationStatus, details })),
            writing: posts.slice(0, 12).map(({ title, date, tags, slug }) => ({ title, date, tags, slug })),
          });
        });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [open, settings]);

  const send = async (query = input) => {
    const userQuery = query.trim();
    const available = remainingQuestions();
    if (!userQuery || pending.current || available <= 0) return;
    pending.current = true;
    setInput(''); recordUse(); setRemaining(remainingQuestions());
    const userMessage: AssistantMessage = { id: nextId(), role: 'user', text: userQuery };
    setMessages(previous => [...previous, userMessage]); setTyping(true);
    const controller = new AbortController(); request.current = controller;
    try {
      const proxyUrl = import.meta.env.VITE_GEMINI_PROXY_URL;
      if (!proxyUrl) throw new Error('Gateway unavailable');
      const recent = [...messages, userMessage].slice(-6);
      const response = await fetch(proxyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({
        system_instruction: { role: 'system', parts: [{ text: `${prompts[mode]}\n\nCURRENT PORTFOLIO DATA (authoritative):\n${context.current || JSON.stringify({ profile: { name: settings.name, positioning: settings.heroBody, currentFocus: settings.currentFocus } })}` }] },
        contents: recent.map(message => ({ role: message.role, parts: [{ text: message.text }] })), temperature: mode === 'RECRUITER' ? 0.2 : 0.55, topP: mode === 'RECRUITER' ? 0.8 : 0.92,
      }) });
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof reply !== 'string' || !reply.trim()) throw new Error('Empty reply');
      if (!mounted.current) return;
      setMessages(previous => [...previous, { id: nextId(), role: 'model', text: reply }]);
      addItem('chatLogs', { sessionId, timestamp: new Date().toISOString(), mode, userQuery, aiResponse: reply }).catch(() => undefined);
    } catch {
      if (!mounted.current || controller.signal.aborted) return;
      setMessages(previous => [...previous, { id: nextId(), role: 'model', text: 'I couldn’t complete that reply. Please try again, or use the contact page to get in touch.', failedQuery: userQuery }]);
    } finally {
      pending.current = false;
      if (mounted.current) setTyping(false);
    }
  };
  const switchMode = (next: AssistantMode) => {
    if (pending.current || next === mode) return;
    setMode(next);
    setMessages([{ id: nextId(), role: 'model', text: next === 'RECRUITER' ? 'Recruiter mode on. Ask about fit, experience, projects, education or credentials.' : 'Standard mode on. What would you like to know?' }]);
  };
  return { settings, mode, switchMode, messages, input, setInput, typing, remaining, send };
};
