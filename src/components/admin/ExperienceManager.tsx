import { useEffect, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { addItem, deleteItem, getExperience, updateItem } from '../../services/db';
import type { Experience } from '../../types/database';
import { AdminField, AdminInput, AdminSection, AdminTextarea } from './AdminUI';

const empty: Partial<Experience> = { role: '', company: '', duration: '', description: [], techStack: [], visible: true, order: 1 };
export const ExperienceManager = () => {
  const [items,setItems]=useState<Experience[]>([]); const [form,setForm]=useState<Partial<Experience>>(empty); const [editing,setEditing]=useState<string|null>(null); const [saving,setSaving]=useState(false);
  const refresh=()=>getExperience().then(setItems); useEffect(()=>{refresh();},[]);
  const save=async(e:React.FormEvent)=>{e.preventDefault();setSaving(true);try{editing?await updateItem('experience',editing,form):await addItem('experience',{...form,order:form.order??items.length+1,visible:form.visible??true});setEditing(null);setForm({...empty,order:items.length+2});await refresh();}finally{setSaving(false);}};
  const remove=async(id:string)=>{if(confirm('Delete this experience entry?')){await deleteItem('experience',id);refresh();}};
  return <AdminSection title="Experience" description="Keep professional experience distinct from labs and personal projects." action={<button className="admin-secondary" onClick={()=>{setEditing(null);setForm({...empty,order:items.length+1});}}><Plus size={15}/> New</button>}>
    <form onSubmit={save} className="admin-editor-card"><div className="admin-form-grid"><AdminField label="Role"><AdminInput required value={form.role??''} onChange={e=>setForm(p=>({...p,role:e.target.value}))}/></AdminField><AdminField label="Company"><AdminInput required value={form.company??''} onChange={e=>setForm(p=>({...p,company:e.target.value}))}/></AdminField><AdminField label="Duration"><AdminInput required value={form.duration??''} onChange={e=>setForm(p=>({...p,duration:e.target.value}))}/></AdminField><AdminField label="Order"><AdminInput type="number" value={form.order??1} onChange={e=>setForm(p=>({...p,order:Number(e.target.value)}))}/></AdminField></div>
      <AdminField label="Responsibility / impact points" hint="One point per line."><AdminTextarea rows={7} value={form.description?.join('\n')??''} onChange={e=>setForm(p=>({...p,description:e.target.value.split('\n').filter(Boolean)}))}/></AdminField>
      <AdminField label="Tech stack" hint="Comma separated."><AdminInput value={form.techStack?.join(', ')??''} onChange={e=>setForm(p=>({...p,techStack:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)}))}/></AdminField>
      <label className="admin-toggle"><input type="checkbox" checked={form.visible??true} onChange={e=>setForm(p=>({...p,visible:e.target.checked}))}/><span>Visible publicly</span></label>
      <div className="admin-save-row">{editing&&<button type="button" className="admin-secondary" onClick={()=>{setEditing(null);setForm(empty);}}><X size={15}/>Cancel</button>}<button className="admin-primary" disabled={saving}><Save size={15}/>{saving?'Saving…':editing?'Update experience':'Create experience'}</button></div>
    </form>
    <div className="admin-list">{items.map(item=><div className="admin-list-row" key={item.id}><div><strong>{item.role}</strong><span>{item.company} · {item.duration}</span></div><div className="admin-row-meta"><span>{item.visible?'Public':'Hidden'}</span><button onClick={()=>{setEditing(item.id!);setForm(item);}}><Edit3 size={16}/></button><button className="danger" onClick={()=>remove(item.id!)}><Trash2 size={16}/></button></div></div>)}</div>
  </AdminSection>;
};
