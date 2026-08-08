import { useEffect, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { addItem, deleteItem, getCertificates, updateItem } from '../../services/db';
import type { Certificate } from '../../types/database';
import { IssuerBadge } from '../ui/IssuerBadge';
import { AdminField, AdminInput, AdminSection, AdminSelect, AdminTextarea } from './AdminUI';

const certificateAssets = Object.keys(import.meta.glob('/public/certifications/*.{png,jpg,jpeg,webp,avif,pdf}', { eager: true, query: '?url', import: 'default' })).map(path => path.replace('/public', ''));

const empty: Partial<Certificate> = { name:'', issuer:'', date:'', credentialId:'', imageUrl:'', category:undefined, details:'', visible:true, order:1 };

const publicPayload = (form: Partial<Certificate>) => {
  // issuerLogo is a legacy field. Ignore it on new writes without requiring a Firestore migration.
  const { issuerLogo, ...payload } = form;
  void issuerLogo;
  return payload;
};

export const CertificateManager=()=>{
 const [items,setItems]=useState<Certificate[]>([]);const[form,setForm]=useState<Partial<Certificate>>(empty);const[editing,setEditing]=useState<string|null>(null);const[saving,setSaving]=useState(false);
 const refresh=()=>getCertificates().then(setItems);useEffect(()=>{refresh();},[]);
 const set=(key:keyof Certificate,value:any)=>setForm(p=>({...p,[key]:value}));
 const save=async(e:React.FormEvent)=>{e.preventDefault();setSaving(true);try{const payload=publicPayload(form);editing?await updateItem('certificates',editing,payload):await addItem('certificates',{...payload,order:form.order??items.length+1,visible:form.visible??true});setEditing(null);setForm({...empty,order:items.length+2});await refresh();}finally{setSaving(false);}};
 const remove=async(id:string)=>{if(confirm('Delete this credential?')){await deleteItem('certificates',id);refresh();}};
 return <AdminSection title="Credentials" description="Add the issuer name once. The portfolio normalizes its identity automatically — no logo files or image sizing required." action={<button className="admin-secondary" onClick={()=>{setEditing(null);setForm({...empty,order:items.length+1});}}><Plus size={15}/> New</button>}>
  <form onSubmit={save} className="admin-editor-card"><div className="admin-form-grid">
   <AdminField label="Name"><AdminInput required value={form.name??''} onChange={e=>set('name',e.target.value)}/></AdminField>
   <AdminField label="Issuer"><div className="admin-issuer-field"><AdminInput required placeholder="e.g. Amazon Web Services" value={form.issuer??''} onChange={e=>set('issuer',e.target.value)}/>{form.issuer?.trim()&&<IssuerBadge issuer={form.issuer} compact withLabel/>}</div></AdminField>
   <AdminField label="Date"><AdminInput required value={form.date??''} onChange={e=>set('date',e.target.value)}/></AdminField>
   <AdminField label="Credential ID"><AdminInput value={form.credentialId??''} onChange={e=>set('credentialId',e.target.value)}/></AdminField>
   <AdminField label="Credential image path / URL"><AdminInput list="credential-assets" placeholder="/certifications/example.png" value={form.imageUrl??''} onChange={e=>set('imageUrl',e.target.value)}/><datalist id="credential-assets">{certificateAssets.map(path=><option key={path} value={path}/>)}</datalist></AdminField>
   <AdminField label="Category"><AdminSelect value={form.category??''} onChange={e=>set('category',e.target.value||undefined)}><option value="">Uncategorized</option><option>Easy</option><option>Challenging</option><option>Hard</option></AdminSelect></AdminField>
   <AdminField label="Order"><AdminInput type="number" value={form.order??1} onChange={e=>set('order',Number(e.target.value))}/></AdminField>
  </div><AdminField label="Optional metadata (JSON)"><AdminTextarea rows={5} value={form.details??''} onChange={e=>set('details',e.target.value)}/></AdminField><label className="admin-toggle"><input type="checkbox" checked={form.visible??true} onChange={e=>set('visible',e.target.checked)}/><span>Visible publicly</span></label><div className="admin-save-row">{editing&&<button type="button" className="admin-secondary" onClick={()=>{setEditing(null);setForm(empty);}}><X size={15}/>Cancel</button>}<button className="admin-primary" disabled={saving}><Save size={15}/>{saving?'Saving…':editing?'Update credential':'Create credential'}</button></div></form>
  <div className="admin-list">{items.map(item=><div className="admin-list-row credential-admin-row" key={item.id}><IssuerBadge issuer={item.issuer} compact/><div><strong>{item.name}</strong><span>{item.issuer} · {item.date}</span></div><div className="admin-row-meta"><span>{item.visible?'Public':'Hidden'}</span><button onClick={()=>{setEditing(item.id!);setForm(item);}}><Edit3 size={16}/></button><button className="danger" onClick={()=>remove(item.id!)}><Trash2 size={16}/></button></div></div>)}</div>
 </AdminSection>;
};
