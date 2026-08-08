import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, BriefcaseBusiness, MessageCircle, Send, Sparkles, UserRound, X } from 'lucide-react';
import { addItem, getPublicCertificates, getPublicExperience, getPublicPosts, getPublicProjects } from '../../services/db';
import { useSiteSettings } from '../../hooks/useSiteSettings';

type Role = 'NORMAL' | 'RECRUITER';
type ChatMessage = { role: 'user' | 'model'; text: string };

const DAILY_LIMIT = 15;
const RATE_LIMIT_KEY = 'chatbot_usage';
const todayKey = () => new Date().toISOString().slice(0, 10);
const getRemaining = () => { try { const raw=localStorage.getItem(RATE_LIMIT_KEY); if(!raw)return DAILY_LIMIT; const parsed=JSON.parse(raw) as {date:string;count:number}; return parsed.date===todayKey()?Math.max(0,DAILY_LIMIT-parsed.count):DAILY_LIMIT; } catch { return DAILY_LIMIT; } };
const recordUse = () => { const date=todayKey(); try { const raw=localStorage.getItem(RATE_LIMIT_KEY); const parsed=raw?JSON.parse(raw):null; const count=parsed?.date===date?parsed.count+1:1; localStorage.setItem(RATE_LIMIT_KEY,JSON.stringify({date,count})); } catch {} };

const prompts: Record<Role, string> = {
  NORMAL: 'You are the portfolio assistant for the person described in the authoritative portfolio data below. Help visitors understand only what is evidenced in the current portfolio data supplied below. System administration is a foundation, while infrastructure, cloud, automation, Kubernetes and reliability are valid directions when supported by the data. Never invent skills, dates, employers, projects or seniority. Clearly distinguish professional experience from labs, projects, learning and certifications. Be warm, concise and specific.',
  RECRUITER: 'You are the portfolio assistant for recruiters and hiring managers evaluating the person described in the authoritative portfolio data below. Use only the current portfolio data supplied below. Summarize evidence relevant to infrastructure, Linux system administration, DevOps, cloud, Kubernetes-adjacent and SRE-oriented opportunities without inflating seniority. Separate professional experience from labs, projects and certifications. If evidence is missing, say so. Encourage a direct conversation when there is a plausible role fit.',
};

export const FloatingChatbot = () => {
  const { settings } = useSiteSettings();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>('NORMAL');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role:'model', text:'Hi — I can help you find the relevant parts of this portfolio without making you hunt through every page.' }]);
  const [input,setInput]=useState(''); const [typing,setTyping]=useState(false); const [remaining,setRemaining]=useState(getRemaining);
  const [sessionId]=useState(()=>`sess_${Date.now()}_${Math.random().toString(36).slice(2,9)}`); const[portfolioContext,setPortfolioContext]=useState('');
  const contextLoaded=useRef(false); const bottomRef=useRef<HTMLDivElement>(null);

  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:reduce?'auto':'smooth'}),[messages,typing,open,reduce]);
  useEffect(()=>{if(!open||contextLoaded.current)return;contextLoaded.current=true;Promise.all([getPublicProjects().catch(()=>[]),getPublicExperience().catch(()=>[]),getPublicCertificates().catch(()=>[]),getPublicPosts().catch(()=>[])]).then(([projects,experience,certificates,posts])=>setPortfolioContext(JSON.stringify({profile:{name:settings.name,location:settings.location,availability:settings.availability,positioning:settings.heroBody,profile:settings.aboutBody,currentFocus:settings.currentFocus,capabilities:settings.capabilities},professionalExperience:experience.map(({role,company,duration,startDate,endDate,description,techStack})=>({role,company,duration,startDate,endDate,description,techStack})),projects:projects.map(({name,description,command,url,problem,built,decisions,outcome,learnings,stack})=>({name,description,command,url,problem,built,decisions,outcome,learnings,stack})),credentials:certificates.map(({name,issuer,date,category,credentialId})=>({name,issuer,date,category,credentialId})),writing:posts.slice(0,12).map(({title,date,tags,slug})=>({title,date,tags,slug}))})))},[open,settings]);
  if(!settings.chatbotEnabled)return null;

  const send=async(event?:React.FormEvent)=>{event?.preventDefault();const userMessage=input.trim();if(!userMessage||typing||remaining<=0)return;setInput('');recordUse();setRemaining(getRemaining());setMessages(p=>[...p,{role:'user',text:userMessage}]);setTyping(true);try{const proxyUrl=import.meta.env.VITE_GEMINI_PROXY_URL;if(!proxyUrl)throw new Error('AI gateway is not configured.');const recent=[...messages,{role:'user' as const,text:userMessage}].slice(-6);const response=await fetch(proxyUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system_instruction:{role:'system',parts:[{text:`${prompts[role]}\n\nCURRENT PORTFOLIO DATA (authoritative):\n${portfolioContext||JSON.stringify({profile:{name:settings.name,positioning:settings.heroBody,currentFocus:settings.currentFocus}})}`}]},contents:recent.map(message=>({role:message.role,parts:[{text:message.text}]})),temperature: role === 'RECRUITER' ? 0.2 : 0.55, topP: role === 'RECRUITER' ? 0.8 : 0.92})});if(!response.ok)throw new Error(`AI gateway returned ${response.status}.`);const data=await response.json();const text=data?.candidates?.[0]?.content?.parts?.[0]?.text??'I could not generate a response.';setMessages(p=>[...p,{role:'model',text}]);addItem('chatLogs',{sessionId,timestamp:new Date().toISOString(),mode:role,userQuery:userMessage,aiResponse:text}).catch(()=>undefined)}catch(error){setMessages(p=>[...p,{role:'model',text:error instanceof Error?`The assistant is temporarily unavailable. ${error.message}`:'The assistant is temporarily unavailable.'}])}finally{setTyping(false)}};
  const switchRole=(next:Role)=>{setRole(next);setMessages([{role:'model',text:next==='RECRUITER'?'Recruiter mode on. Ask about fit, experience, projects or credentials.':'Standard mode on. What would you like to know?'}])};

  const panelTransition = reduce ? { duration: 0 } : { type:'spring' as const, stiffness:360, damping:31, mass:.82 };
  return <div className="chatbot-dock">
    <AnimatePresence mode="wait" initial={false}>
      {open ? <motion.section key="panel" className="chatbot-panel" aria-label="Portfolio assistant" initial={reduce?false:{opacity:0,y:24,scale:.94,filter:'blur(7px)'}} animate={{opacity:1,y:0,scale:1,filter:'blur(0px)'}} exit={reduce?undefined:{opacity:0,y:18,scale:.96,filter:'blur(5px)'}} transition={panelTransition}>
        <header className="chatbot-header"><div className="chatbot-title"><span className="chatbot-orb"><Bot size={18}/></span><div><strong>Ask about {settings.shortName.split(' ')[0]}</strong><small>Portfolio guide</small></div></div><button className="chat-icon-button" onClick={()=>setOpen(false)} aria-label="Close assistant"><X size={19}/></button></header>
        <div className="chatbot-modes"><button className={role==='NORMAL'?'active':''} onClick={()=>switchRole('NORMAL')}><UserRound size={14}/>Visitor</button><button className={role==='RECRUITER'?'active':''} onClick={()=>switchRole('RECRUITER')}><BriefcaseBusiness size={14}/>Recruiter</button></div>
        <div className="chatbot-messages">{messages.map((message,index)=><motion.div initial={reduce?false:{opacity:0,y:7}} animate={{opacity:1,y:0}} transition={{duration:.25}} key={index} className={`chat-message ${message.role}`}>{message.text}</motion.div>)}{typing&&<div className="chat-message model typing-dots"><span/><span/><span/></div>}<div ref={bottomRef}/></div>
        <form className="chatbot-form" onSubmit={send}><input value={input} onChange={e=>setInput(e.target.value)} placeholder={remaining?'Ask about experience, projects, skills…':'Daily limit reached'} disabled={!remaining} aria-label="Message"/><button type="submit" disabled={!input.trim()||typing||!remaining} aria-label="Send message"><Send size={16}/></button></form>
        <div className="chatbot-limit">{remaining}/{DAILY_LIMIT} questions remaining today</div>
      </motion.section> : <motion.button key="launch" className="chatbot-launch" onClick={()=>setOpen(true)} aria-label="Open portfolio assistant" initial={reduce?false:{opacity:0,y:10,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={reduce?undefined:{opacity:0,y:8,scale:.94}} transition={panelTransition} whileHover={reduce?undefined:{y:-3,scale:1.018}} whileTap={reduce?undefined:{scale:.97}}><MessageCircle size={21}/><span>Ask about me</span><Sparkles size={13}/></motion.button>}
    </AnimatePresence>
  </div>;
};
