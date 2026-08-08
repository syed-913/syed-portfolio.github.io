import { useEffect, useState } from 'react';
import { Bot, Trash2 } from 'lucide-react';
import { deleteItem, getChatLogs } from '../../services/db';
import { AdminSection } from './AdminUI';

export const ChatLogsViewer=()=>{const[logs,setLogs]=useState<any[]>([]);const refresh=()=>getChatLogs().then(setLogs);useEffect(()=>{refresh();},[]);const remove=async(id:string)=>{await deleteItem('chatLogs',id);refresh();};return <AdminSection title="AI assistant logs" description="Recent visitor questions recorded by the existing Gemini proxy workflow."><div className="message-list">{logs.slice(0,100).map(log=><article className="message-card" key={log.id}><div className="message-head"><div><span className="message-icon"><Bot size={15}/></span><strong>{log.mode||'NORMAL'} mode</strong><small>{log.sessionId}</small></div><time>{log.timestamp?new Date(log.timestamp).toLocaleString():''}</time></div><p><b>Q:</b> {log.userQuery}</p><p><b>A:</b> {log.aiResponse}</p><div className="message-actions"><button className="danger" onClick={()=>remove(log.id)}><Trash2 size={15}/>Delete</button></div></article>)}</div></AdminSection>};
