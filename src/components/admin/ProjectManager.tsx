import { useEffect, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { addItem, deleteItem, getProjects, updateItem } from '../../services/adminDb';
import type { Project } from '../../types/database';
import { AdminField, AdminInput, AdminSection, AdminTextarea } from './AdminUI';

const empty: Partial<Project> = {
  name: '',
  command: '',
  description: '',
  problem: '',
  built: '',
  decisions: [],
  outcome: '',
  learnings: '',
  stack: [],
  url: '',
  output: '',
  visible: true,
  order: 1,
};

export const ProjectManager = () => {
  const [items, setItems] = useState<Project[]>([]);
  const [form, setForm] = useState<Partial<Project>>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = () => getProjects().then(setItems);
  useEffect(() => { refresh(); }, []);
  const change = (key: keyof Project, value: any) => setForm((previous) => ({ ...previous, [key]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        order: form.order ?? items.length + 1,
        visible: form.visible ?? true,
        decisions: form.decisions?.filter(Boolean) ?? [],
        stack: form.stack?.filter(Boolean) ?? [],
      };
      editing ? await updateItem('projects', editing, payload) : await addItem('projects', payload);
      setEditing(null);
      setForm({ ...empty, order: items.length + 2 });
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const edit = (item: Project) => {
    setEditing(item.id!);
    setForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    if (confirm('Delete this project?')) {
      await deleteItem('projects', id);
      refresh();
    }
  };

  return (
    <AdminSection
      title="Projects"
      description="Keep the short summary recruiter-friendly, then add optional case-study detail for technical readers. Existing project records remain compatible."
      action={<button className="admin-secondary" onClick={() => { setEditing(null); setForm({ ...empty, order: items.length + 1 }); }}><Plus size={15}/> New</button>}
    >
      <form onSubmit={save} className="admin-editor-card">
        <div className="admin-form-grid">
          <AdminField label="Project name"><AdminInput required value={form.name ?? ''} onChange={(e) => change('name', e.target.value)} /></AdminField>
          <AdminField label="Technical label / command"><AdminInput value={form.command ?? ''} onChange={(e) => change('command', e.target.value)} /></AdminField>
          <AdminField label="Project URL"><AdminInput value={form.url ?? ''} onChange={(e) => change('url', e.target.value)} placeholder="Optional GitHub, demo or reference URL" /></AdminField>
          <AdminField label="Order"><AdminInput type="number" value={form.order ?? 1} onChange={(e) => change('order', Number(e.target.value))} /></AdminField>
        </div>

        <AdminField label="Short summary" hint="One recruiter-friendly paragraph: what the project is and why it matters.">
          <AdminTextarea required rows={4} value={form.description ?? ''} onChange={(e) => change('description', e.target.value)} />
        </AdminField>

        <div className="admin-subsection project-story-editor">
          <div>
            <h3>Case study</h3>
            <p className="admin-help">Optional. Fill only the sections that add evidence. Leaving them blank keeps old projects unchanged.</p>
          </div>
          <div className="admin-form-grid">
            <AdminField label="Problem / context"><AdminTextarea rows={4} value={form.problem ?? ''} onChange={(e) => change('problem', e.target.value)} /></AdminField>
            <AdminField label="What I built"><AdminTextarea rows={4} value={form.built ?? ''} onChange={(e) => change('built', e.target.value)} /></AdminField>
            <AdminField label="Outcome / result"><AdminTextarea rows={4} value={form.outcome ?? ''} onChange={(e) => change('outcome', e.target.value)} /></AdminField>
            <AdminField label="What I learned"><AdminTextarea rows={4} value={form.learnings ?? ''} onChange={(e) => change('learnings', e.target.value)} /></AdminField>
          </div>
          <AdminField label="Key decisions" hint="One decision per line. Focus on trade-offs rather than a raw task list.">
            <AdminTextarea rows={5} value={form.decisions?.join('\n') ?? ''} onChange={(e) => change('decisions', e.target.value.split('\n').map((value) => value.trim()).filter(Boolean))} />
          </AdminField>
          <AdminField label="Tools / stack" hint="Comma separated. These become compact evidence chips on the public project cards.">
            <AdminInput value={form.stack?.join(', ') ?? ''} onChange={(e) => change('stack', e.target.value.split(',').map((value) => value.trim()).filter(Boolean))} />
          </AdminField>
        </div>

        <AdminField label="Optional technical detail (HTML)" hint="Legacy/deep-detail field retained for existing records. It appears below the structured case study when present.">
          <AdminTextarea rows={7} value={form.output ?? ''} onChange={(e) => change('output', e.target.value)} />
        </AdminField>

        <label className="admin-toggle"><input type="checkbox" checked={form.visible ?? true} onChange={(e) => change('visible', e.target.checked)} /><span>Visible publicly</span></label>
        <div className="admin-save-row">
          {editing && <button type="button" className="admin-secondary" onClick={() => { setEditing(null); setForm(empty); }}><X size={15}/> Cancel</button>}
          <button className="admin-primary" disabled={saving}><Save size={15}/>{saving ? 'Saving…' : editing ? 'Update project' : 'Create project'}</button>
        </div>
      </form>

      <div className="admin-list">
        {items.map((item) => (
          <div className="admin-list-row" key={item.id}>
            <div><strong>{item.name}</strong><span>{item.description}</span></div>
            <div className="admin-row-meta"><span>{item.visible ? 'Public' : 'Hidden'}</span><button onClick={() => edit(item)}><Edit3 size={16}/></button><button onClick={() => remove(item.id!)} className="danger"><Trash2 size={16}/></button></div>
          </div>
        ))}
      </div>
    </AdminSection>
  );
};
