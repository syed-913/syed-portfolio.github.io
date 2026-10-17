import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, usePresence, useReducedMotion } from 'framer-motion';
import { Bot, BriefcaseBusiness, Send, UserRound, X } from 'lucide-react';
import { addItem, getPublicCertificates, getPublicExperience, getPublicPosts, getPublicProjects } from '../../services/db';
import { useSiteSettings } from '../../hooks/useSiteSettings';


// Hold the exit's final pixels until React removes the overlay. Committing the
// end state before cancelling WAAPI prevents its underlying opacity resurfacing.
const AssistantPanel = ({ children, panelRef }: { children: ReactNode; panelRef: RefObject<HTMLElement | null> }) => {
  const [present, safeToRemove] = usePresence();
  const reduce = useReducedMotion();
  useEffect(() => {
    const element = panelRef.current;
    if (!element) return;
    const current = getComputedStyle(element);
    const reduced = reduce || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const first = element.dataset.entered !== 'true' && Number(current.opacity) < 0.001;
    const end = { opacity: present ? '1' : '0', transform: reduced ? 'none' : present ? 'translateY(0px)' : 'translateY(8px)' };
    const animation = element.animate([
      { opacity: first ? '0' : current.opacity, transform: reduced ? 'none' : first ? 'translateY(20px)' : current.transform },
      end,
    ], { duration: reduced ? 80 : present ? 420 : 140, delay: first && present && !reduced ? 70 : 0, easing: present ? 'cubic-bezier(0.16,1,0.3,1)' : 'cubic-bezier(0.4,0,1,1)', fill: 'both' });
    let cancelled = false;
    animation.finished.then(() => {
      if (cancelled) return;
      if (present) element.dataset.entered = 'true';
      element.style.opacity = end.opacity;
      element.style.transform = end.transform;
      animation.cancel();
      if (!present) safeToRemove?.();
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      const frame = getComputedStyle(element);
      // A development effect replay at opacity zero is still a first arrival.
      // A visible interrupted frame must continue without restarting the delay.
      if (Number(frame.opacity) >= 0.001) element.dataset.entered = 'true';
      element.style.opacity = frame.opacity;
      element.style.transform = frame.transform;
      animation.cancel();
    };
  }, [present, reduce, safeToRemove, panelRef]);
  return <section ref={panelRef} id="portfolio-assistant" className="chatbot-panel" aria-label="Portfolio assistant" tabIndex={-1} style={{ opacity: 0 }}>{children}</section>;
};

type Role = 'NORMAL' | 'RECRUITER';
type ChatMessage = { role: 'user' | 'model'; text: string };

const DAILY_LIMIT = 15;
const RATE_LIMIT_KEY = 'chatbot_usage';
const todayKey = () => new Date().toISOString().slice(0, 10);
const getRemaining = () => { try { const raw=localStorage.getItem(RATE_LIMIT_KEY); if(!raw)return DAILY_LIMIT; const parsed=JSON.parse(raw) as {date:string;count:number}; return parsed.date===todayKey()?Math.max(0,DAILY_LIMIT-parsed.count):DAILY_LIMIT; } catch { return DAILY_LIMIT; } };
const recordUse = () => { const date=todayKey(); try { const raw=localStorage.getItem(RATE_LIMIT_KEY); const parsed=raw?JSON.parse(raw):null; const count=parsed?.date===date?parsed.count+1:1; localStorage.setItem(RATE_LIMIT_KEY,JSON.stringify({date,count})); } catch {} };

const prompts: Record<Role, string> = {
  NORMAL: 'You are the portfolio assistant for the person described in the authoritative portfolio data below. Help visitors understand only what is evidenced in the current portfolio data supplied below. System administration is a foundation, while infrastructure, cloud, automation, Kubernetes and reliability are valid directions when supported by the data. Never invent skills, dates, employers, projects or seniority. Clearly distinguish professional experience from labs, projects, certifications and formal education. Be warm, concise and specific.',
  RECRUITER: 'You are the portfolio assistant for recruiters and hiring managers evaluating the person described in the authoritative portfolio data below. Use only the current portfolio data supplied below. Summarize evidence relevant to infrastructure, Linux system administration, DevOps, cloud, Kubernetes-adjacent and SRE-oriented opportunities without inflating seniority. Separate professional experience from labs, projects, certifications and formal education. If evidence is missing, say so. Encourage a direct conversation when there is a plausible role fit.',
};

export const FloatingChatbot = ({ open, onClose, onExitComplete }: { open: boolean; onClose: () => void; onExitComplete: () => void }) => {
  const { settings } = useSiteSettings();
  const reduce = useReducedMotion();
  const [role, setRole] = useState<Role>('NORMAL');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role:'model', text:'Hi — I can help you find the relevant parts of this portfolio without making you hunt through every page.' }]);
  const [input,setInput]=useState(''); const [typing,setTyping]=useState(false); const [remaining,setRemaining]=useState(getRemaining);
  const [sessionId]=useState(()=>`sess_${Date.now()}_${Math.random().toString(36).slice(2,9)}`); const[portfolioContext,setPortfolioContext]=useState('');
  const contextLoaded=useRef(false); const bottomRef=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLInputElement>(null); const panelRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!open)return;
    const timer=window.setTimeout(()=>{
      const touch=window.matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0;
      const target=touch?panelRef.current:inputRef.current;
      target?.focus({preventScroll:true});
    },reduce?0:100);
    return()=>window.clearTimeout(timer);
  },[open,reduce]);

  useEffect(()=>{ const container=bottomRef.current?.parentElement;container?.scrollTo({top:container.scrollHeight,behavior:reduce?'auto':'smooth'}); },[messages,typing,open,reduce]);
  useEffect(()=>{
    if(!open)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[open,onClose]);
  useEffect(()=>{
    if(!open||contextLoaded.current)return;
    const timer=window.setTimeout(()=>{
      contextLoaded.current=true;
      Promise.all([getPublicProjects().catch(()=>[]),getPublicExperience().catch(()=>[]),getPublicCertificates().catch(()=>[]),getPublicPosts().catch(()=>[])])
        .then(([projects,experience,certificates,posts])=>setPortfolioContext(JSON.stringify({profile:{name:settings.name,location:settings.location,availability:settings.availability,positioning:settings.heroBody,profile:settings.aboutBody,currentFocus:settings.currentFocus,capabilities:settings.capabilities},professionalExperience:experience.map(({role,company,duration,startDate,endDate,description,techStack})=>({role,company,duration,startDate,endDate,description,techStack})),projects:projects.map(({name,description,command,url,problem,built,decisions,outcome,learnings,stack})=>({name,description,command,url,problem,built,decisions,outcome,learnings,stack})),credentials:certificates.filter(item=>item.entryType!=='education').map(({name,issuer,date,category,credentialId})=>({name,issuer,date,category,credentialId})),education:certificates.filter(item=>item.entryType==='education').map(({name,institution,field,startDate,endDate,educationStatus,details})=>({name,institution,field,startDate,endDate,educationStatus,details})),writing:posts.slice(0,12).map(({title,date,tags,slug})=>({title,date,tags,slug}))})));
    },260);
    return()=>window.clearTimeout(timer);
  },[open,settings]);
  if(!settings.chatbotEnabled)return null;

  const send=async(event?:React.FormEvent)=>{event?.preventDefault();const userMessage=input.trim();if(!userMessage||typing||remaining<=0)return;setInput('');recordUse();setRemaining(getRemaining());setMessages(p=>[...p,{role:'user',text:userMessage}]);setTyping(true);try{const proxyUrl=import.meta.env.VITE_GEMINI_PROXY_URL;if(!proxyUrl)throw new Error('AI gateway is not configured.');const recent=[...messages,{role:'user' as const,text:userMessage}].slice(-6);const response=await fetch(proxyUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system_instruction:{role:'system',parts:[{text:`${prompts[role]}\n\nCURRENT PORTFOLIO DATA (authoritative):\n${portfolioContext||JSON.stringify({profile:{name:settings.name,positioning:settings.heroBody,currentFocus:settings.currentFocus}})}`}]},contents:recent.map(message=>({role:message.role,parts:[{text:message.text}]})),temperature: role === 'RECRUITER' ? 0.2 : 0.55, topP: role === 'RECRUITER' ? 0.8 : 0.92})});if(!response.ok)throw new Error(`AI gateway returned ${response.status}.`);const data=await response.json();const text=data?.candidates?.[0]?.content?.parts?.[0]?.text??'I could not generate a response.';setMessages(p=>[...p,{role:'model',text}]);addItem('chatLogs',{sessionId,timestamp:new Date().toISOString(),mode:role,userQuery:userMessage,aiResponse:text}).catch(()=>undefined)}catch(error){setMessages(p=>[...p,{role:'model',text:error instanceof Error?`The assistant is temporarily unavailable. ${error.message}`:'The assistant is temporarily unavailable.'}])}finally{setTyping(false)}};
  const switchRole=(next:Role)=>{setRole(next);setMessages([{role:'model',text:next==='RECRUITER'?'Recruiter mode on. Ask about fit, experience, projects, education or credentials.':'Standard mode on. What would you like to know?'}])};

  return createPortal(<AnimatePresence onExitComplete={onExitComplete}>
      {open && <AssistantPanel key="panel" panelRef={panelRef}>
        <header className="chatbot-header"><div className="chatbot-title"><span className="chatbot-orb"><Bot size={18}/></span><div><strong>Ask about {settings.shortName.split(' ')[0]}</strong><small>Portfolio guide</small></div></div><button className="chat-icon-button" onClick={onClose} aria-label="Close assistant"><X size={19}/></button></header>
        <div className="chatbot-modes"><button className={role==='NORMAL'?'active':''} aria-pressed={role==='NORMAL'} onClick={()=>switchRole('NORMAL')}><UserRound size={14}/>Visitor</button><button className={role==='RECRUITER'?'active':''} aria-pressed={role==='RECRUITER'} onClick={()=>switchRole('RECRUITER')}><BriefcaseBusiness size={14}/>Recruiter</button></div>
        <div className="chatbot-messages" aria-live="polite">{messages.map((message,index)=><motion.div initial={reduce?false:{opacity:0,y:7}} animate={{opacity:1,y:0}} transition={{duration:.25}} key={index} className={`chat-message ${message.role}`}>{message.text}</motion.div>)}{typing&&<div className="chat-message model typing-dots"><span/><span/><span/></div>}<div ref={bottomRef}/></div>
        <form className="chatbot-form" onSubmit={send}><input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} placeholder={remaining?'Ask about experience, projects, skills…':'Daily limit reached'} disabled={!remaining} aria-label="Message"/><button type="submit" disabled={!input.trim()||typing||!remaining} aria-label="Send message"><Send size={16}/></button></form>
        <div className="chatbot-limit">{remaining}/{DAILY_LIMIT} questions remaining today</div>
      </AssistantPanel>}
    </AnimatePresence>, document.body);

};
