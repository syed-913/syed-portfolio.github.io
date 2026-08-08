import { useEffect, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { addItem, deleteItem, getProjects, updateItem } from '../../services/db';
import type { Project } from '../../types/database';
import { AdminField, AdminInput, AdminSection, AdminTextarea } from './AdminUI';

const empty: Partial<Project> = { name: '', command: '', description: '', url: '', output: '', visible: true, order: 1 };

export const ProjectManager = () => {
  const [items, setItems] = useState<Project[]>([]); const [form, setForm] = useState<Partial<Project>>(empty); const [editing, setEditing] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const refresh = () => getProjects().then(setItems); useEffect(() => { refresh(); }, []);
  const change = (key: keyof Project, value: any) => setForm((p) => ({ ...p, [key]: value }));
  const save = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { editing ? await updateItem('projects', editing, form) : await addItem('projects', { ...form, order: form.order ?? items.length + 1, visible: form.visible ?? true }); setEditing(null); setForm({ ...empty, order: items.length + 2 }); await refresh(); } finally { setSaving(false); } };
  const edit = (item: Project) => { setEditing(item.id!); setForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (id: string) => { if (confirm('Delete this project?')) { await deleteItem('projects', id); refresh(); } };

  return <AdminSection title="Projects" description="Manage project stories. Existing Firebase collection and field names are preserved." action={<button className="admin-secondary" onClick={() => { setEditing(null); setForm({ ...empty, order: items.length + 1 }); }}><Plus size={15}/> New</button>}>
    <form onSubmit={save} className="admin-editor-card">
      <div className="admin-form-grid"><AdminField label="Project name"><AdminInput required value={form.name ?? ''} onChange={(e) => change('name', e.target.value)} /></AdminField><AdminField label="Technical label / command"><AdminInput value={form.command ?? ''} onChange={(e) => change('command', e.target.value)} /></AdminField><AdminField label="Project URL"><AdminInput required value={form.url ?? ''} onChange={(e) => change('url', e.target.value)} /></AdminField><AdminField label="Order"><AdminInput type="number" value={form.order ?? 1} onChange={(e) => change('order', Number(e.target.value))} /></AdminField></div>
      <AdminField label="Description"><AdminTextarea required rows={4} value={form.description ?? ''} onChange={(e) => change('description', e.target.value)} /></AdminField>
      <AdminField label="Optional technical detail (HTML)" hint="Still supported for your existing project records; shown only when a visitor expands technical detail."><AdminTextarea rows={7} value={form.output ?? ''} onChange={(e) => change('output', e.target.value)} /></AdminField>
      <label className="admin-toggle"><input type="checkbox" checked={form.visible ?? true} onChange={(e) => change('visible', e.target.checked)} /><span>Visible publicly</span></label>
      <div className="admin-save-row">{editing && <button type="button" className="admin-secondary" onClick={() => { setEditing(null); setForm(empty); }}><X size={15}/> Cancel</button>}<button className="admin-primary" disabled={saving}><Save size={15}/>{saving ? 'Saving…' : editing ? 'Update project' : 'Create project'}</button></div>
    </form>
    <div className="admin-list">{items.map((item) => <div className="admin-list-row" key={item.id}><div><strong>{item.name}</strong><span>{item.description}</span></div><div className="admin-row-meta"><span>{item.visible ? 'Public' : 'Hidden'}</span><button onClick={() => edit(item)}><Edit3 size={16}/></button><button onClick={() => remove(item.id!)} className="danger"><Trash2 size={16}/></button></div></div>)}</div>
  </AdminSection>;
};
