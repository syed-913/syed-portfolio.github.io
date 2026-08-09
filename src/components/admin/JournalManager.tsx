import { useEffect, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { addItem, deleteItem, getPosts, updateItem } from '../../services/adminDb';
import type { BlogPost } from '../../types/database';
import { displayReadTime } from '../../lib/writing';
import { AdminField, AdminInput, AdminSection, AdminTextarea } from './AdminUI';

const empty: Partial<BlogPost> = {
  title: '',
  slug: '',
  date: new Date().toISOString().slice(0, 10),
  tags: [],
  content: '',
  visible: true,
  upvotes: 0,
};

export const JournalManager = () => {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<Partial<BlogPost>>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const refresh = () => getPosts().then(setItems);
  useEffect(() => { refresh(); }, []);
  const set = (key: keyof BlogPost, value: any) => setForm((previous) => ({ ...previous, [key]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      editing ? await updateItem('posts', editing, form) : await addItem('posts', { ...form, visible: form.visible ?? true, upvotes: 0 });
      setEditing(null);
      setForm(empty);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (confirm('Delete this field note?')) {
      await deleteItem('posts', id);
      refresh();
    }
  };

  const previewReadTime = displayReadTime({ content: form.content ?? '' });

  return (
    <AdminSection
      title="Writing"
      description="Publish Markdown field notes. Reading time is calculated automatically from the article content."
      action={<button className="admin-secondary" onClick={() => { setEditing(null); setForm(empty); }}><Plus size={15}/>New</button>}
    >
      <form onSubmit={save} className="admin-editor-card">
        <div className="admin-form-grid">
          <AdminField label="Title"><AdminInput required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} /></AdminField>
          <AdminField label="Slug"><AdminInput required value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))} /></AdminField>
          <AdminField label="Date"><AdminInput value={form.date ?? ''} onChange={(e) => set('date', e.target.value)} /></AdminField>
          <AdminField label="Estimated reading time"><AdminInput readOnly value={previewReadTime} /></AdminField>
        </div>
        <AdminField label="Tags" hint="Comma separated"><AdminInput value={form.tags?.join(', ') ?? ''} onChange={(e) => set('tags', e.target.value.split(',').map((value) => value.trim()).filter(Boolean))} /></AdminField>
        <AdminField label="Markdown content"><AdminTextarea rows={22} value={form.content ?? ''} onChange={(e) => set('content', e.target.value)} /></AdminField>
        <label className="admin-toggle"><input type="checkbox" checked={form.visible ?? true} onChange={(e) => set('visible', e.target.checked)} /><span>Published publicly</span></label>
        <div className="admin-save-row">
          {editing && <button type="button" className="admin-secondary" onClick={() => { setEditing(null); setForm(empty); }}><X size={15}/>Cancel</button>}
          <button className="admin-primary" disabled={saving}><Save size={15}/>{saving ? 'Saving…' : editing ? 'Update note' : 'Publish note'}</button>
        </div>
      </form>
      <div className="admin-list">
        {items.map((item) => (
          <div className="admin-list-row" key={item.id}>
            <div><strong>{item.title}</strong><span>{item.date} · {displayReadTime(item)} · {item.upvotes ?? 0} useful votes</span></div>
            <div className="admin-row-meta"><span>{item.visible ? 'Published' : 'Draft'}</span><button onClick={() => { setEditing(item.id!); setForm(item); }}><Edit3 size={16}/></button><button className="danger" onClick={() => remove(item.id!)}><Trash2 size={16}/></button></div>
          </div>
        ))}
      </div>
    </AdminSection>
  );
};
