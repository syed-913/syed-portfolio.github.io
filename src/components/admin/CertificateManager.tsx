import { useEffect, useMemo, useRef, useState } from 'react';
import { Award, CheckCircle2, Clock3, Edit3, ExternalLink, FileCheck2, GraduationCap, Plus, Save, Trash2, UploadCloud, X } from 'lucide-react';
import { addItem, deleteItem, getCertificates, updateItem } from '../../services/adminDb';
import { deleteCredentialMedia, uploadCredentialMedia } from '../../lib/media';
import { learningEntryType, type Certificate, type EducationStatus, type LearningEntryType } from '../../types/database';
import { IssuerBadge } from '../ui/IssuerBadge';
import { AdminField, AdminInput, AdminSection, AdminSelect, AdminTextarea } from './AdminUI';

const empty: Partial<Certificate> = {
  name: '', entryType: 'certificate', issuer: '', date: '', credentialId: '', imageUrl: '', mediaFileId: '', mediaProvider: undefined,
  category: undefined, details: '', institution: '', field: '', startDate: '', endDate: '', educationStatus: 'in_progress', visible: true, order: 1,
};
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'application/pdf']);
type Filter = 'all' | 'certificate' | 'education' | 'in_progress';

const payloadFor = (form: Partial<Certificate>) => {
  const type: LearningEntryType = form.entryType === 'education' ? 'education' : 'certificate';
  const base = {
    name: form.name?.trim() || '',
    entryType: type,
    details: form.details?.trim() || '',
    visible: form.visible ?? true,
    order: form.order ?? 1,
  };

  if (type === 'education') {
    return {
      ...base,
      institution: form.institution?.trim() || '',
      field: form.field?.trim() || '',
      startDate: form.startDate?.trim() || '',
      endDate: form.endDate?.trim() || '',
      educationStatus: (form.educationStatus || 'in_progress') as EducationStatus,
      // Clear certificate-only values if an existing record changes type.
      issuer: '', date: '', credentialId: '', credentialUrl: '', imageUrl: '', mediaFileId: '', mediaProvider: null,
      storagePath: '', image: '', url: '', category: null,
    };
  }

  return {
    ...base,
    issuer: form.issuer?.trim() || '',
    date: form.date?.trim() || '',
    credentialId: form.credentialId?.trim() || '',
    credentialUrl: form.credentialUrl?.trim() || '',
    imageUrl: form.imageUrl || '',
    mediaFileId: form.mediaFileId || '',
    mediaProvider: form.mediaProvider || null,
    storagePath: form.storagePath || '',
    image: form.image || '',
    url: form.url || '',
    category: form.category || null,
    // Clear education-only values if an existing record changes type.
    institution: '', field: '', startDate: '', endDate: '', educationStatus: null,
  };
};

export const CertificateManager = () => {
  const [items, setItems] = useState<Certificate[]>([]);
  const [form, setForm] = useState<Partial<Certificate>>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => getCertificates().then(setItems);
  useEffect(() => { refresh(); }, []);
  const set = (key: keyof Certificate, value: any) => setForm((previous) => ({ ...previous, [key]: value }));
  const savedItem = () => editing ? items.find((item) => item.id === editing) : undefined;
  const entryType: LearningEntryType = form.entryType === 'education' ? 'education' : 'certificate';

  const filteredItems = useMemo(() => items.filter((item) => {
    const type = learningEntryType(item);
    if (filter === 'all') return true;
    if (filter === 'in_progress') return type === 'education' && item.educationStatus === 'in_progress';
    return type === filter;
  }), [items, filter]);

  const counts = useMemo(() => ({
    certificates: items.filter((item) => learningEntryType(item) === 'certificate').length,
    education: items.filter((item) => learningEntryType(item) === 'education').length,
    active: items.filter((item) => learningEntryType(item) === 'education' && item.educationStatus === 'in_progress').length,
  }), [items]);

  const removeUncommittedUpload = async () => {
    const saved = savedItem();
    if (form.mediaProvider === 'imagekit' && form.mediaFileId && form.mediaFileId !== saved?.mediaFileId) {
      await deleteCredentialMedia(form.mediaFileId).catch(() => undefined);
    }
  };

  const resetEditor = async () => {
    await removeUncommittedUpload();
    setEditing(null);
    setForm({ ...empty, order: items.length + 1 });
    setUploadError('');
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const detachCredential = async () => {
    await removeUncommittedUpload();
    setForm((previous) => ({ ...previous, imageUrl: '', mediaFileId: '', mediaProvider: undefined }));
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const uploadCredential = async (file?: File) => {
    if (!file || entryType !== 'certificate') return;
    setUploadError('');
    if (!allowedTypes.has(file.type)) { setUploadError('Use PNG, JPG, WebP, AVIF or PDF.'); return; }
    if (file.size > MAX_FILE_BYTES) { setUploadError('Keep credential files under 12 MB.'); return; }

    setUploading(true);
    setUploadProgress(0);
    try {
      await removeUncommittedUpload();
      const uploaded = await uploadCredentialMedia(file, setUploadProgress);
      setForm((previous) => ({
        ...previous,
        imageUrl: uploaded.url,
        mediaFileId: uploaded.fileId,
        mediaProvider: 'imagekit',
        storagePath: '',
      }));
      setUploadProgress(100);
      if (fileRef.current) fileRef.current.value = '';
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Credential upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploading) return;
    if (entryType === 'certificate' && !form.issuer?.trim()) { setUploadError('Issuer is required for a certification.'); return; }
    if (entryType === 'education' && !form.institution?.trim()) { setUploadError('Institution is required for an education entry.'); return; }
    if (entryType === 'education' && !form.startDate?.trim()) { setUploadError('Start date is required for an education entry.'); return; }
    if (entryType === 'education' && form.educationStatus === 'completed' && !form.endDate?.trim()) { setUploadError('Add a completion date for completed education.'); return; }

    setSaving(true);
    setUploadError('');
    const previous = editing ? items.find((item) => item.id === editing) : undefined;
    const payload = payloadFor(form);
    try {
      if (editing) await updateItem('certificates', editing, payload);
      else await addItem('certificates', { ...payload, order: form.order ?? items.length + 1, visible: form.visible ?? true });

      if (previous?.mediaProvider === 'imagekit' && previous.mediaFileId && previous.mediaFileId !== (entryType === 'certificate' ? form.mediaFileId : undefined)) {
        deleteCredentialMedia(previous.mediaFileId).catch(() => undefined);
      }

      setEditing(null);
      setForm({ ...empty, order: items.length + 2 });
      setUploadProgress(0);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!confirm(`Delete this ${learningEntryType(item || {} as Certificate) === 'education' ? 'education entry' : 'credential'}?`)) return;
    await deleteItem('certificates', id);
    if (item?.mediaProvider === 'imagekit' && item.mediaFileId) {
      deleteCredentialMedia(item.mediaFileId).catch(() => undefined);
    }
    refresh();
  };

  const edit = async (item: Certificate) => {
    await removeUncommittedUpload();
    setEditing(item.id!);
    setForm({ ...item, entryType: learningEntryType(item), educationStatus: item.educationStatus || 'in_progress' });
    setUploadError('');
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  return <AdminSection
    title="Credentials & education"
    description="Manage certifications and academic learning in one place. Existing records stay certificates unless you explicitly change their type."
    action={<button className="admin-secondary" onClick={resetEditor}><Plus size={15} /> New learning entry</button>}
  >
    <form onSubmit={save} className="admin-editor-card learning-editor-card">
      <AdminField label="Entry type" hint="This controls which fields and public layout are used.">
        <div className="entry-type-switch" role="group" aria-label="Learning entry type">
          <button type="button" className={entryType === 'certificate' ? 'active' : ''} onClick={() => set('entryType', 'certificate')}><Award size={16} /><span><strong>Certification</strong><small>Credential / training validation</small></span></button>
          <button type="button" className={entryType === 'education' ? 'active' : ''} onClick={() => set('entryType', 'education')}><GraduationCap size={16} /><span><strong>Education</strong><small>Academic program / qualification</small></span></button>
        </div>
      </AdminField>

      <div className="admin-form-grid">
        <AdminField label={entryType === 'education' ? 'Program / qualification' : 'Certificate name'}><AdminInput required value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} /></AdminField>
        {entryType === 'certificate' ? (
          <AdminField label="Issuer"><div className="admin-issuer-field"><AdminInput required placeholder="e.g. Amazon Web Services" value={form.issuer ?? ''} onChange={(e) => set('issuer', e.target.value)} />{form.issuer?.trim() && <IssuerBadge issuer={form.issuer} compact withLabel />}</div></AdminField>
        ) : (
          <AdminField label="Institution"><div className="admin-issuer-field"><AdminInput required placeholder="University / institute / college" value={form.institution ?? ''} onChange={(e) => set('institution', e.target.value)} />{form.institution?.trim() && <IssuerBadge issuer={form.institution} compact withLabel label="Institution" />}</div></AdminField>
        )}

        {entryType === 'certificate' ? <>
          <AdminField label="Issue date"><AdminInput required value={form.date ?? ''} onChange={(e) => set('date', e.target.value)} /></AdminField>
          <AdminField label="Credential ID"><AdminInput value={form.credentialId ?? ''} onChange={(e) => set('credentialId', e.target.value)} /></AdminField>
          <AdminField label="Category"><AdminSelect value={form.category ?? ''} onChange={(e) => set('category', (e.target.value || undefined) as Certificate['category'])}><option value="">Uncategorized</option><option>Easy</option><option>Challenging</option><option>Hard</option></AdminSelect></AdminField>
        </> : <>
          <AdminField label="Field / specialization"><AdminInput placeholder="e.g. Information Technology" value={form.field ?? ''} onChange={(e) => set('field', e.target.value)} /></AdminField>
          <AdminField label="Status"><AdminSelect value={form.educationStatus ?? 'in_progress'} onChange={(e) => set('educationStatus', e.target.value as EducationStatus)}><option value="in_progress">In progress</option><option value="completed">Completed</option></AdminSelect></AdminField>
          <AdminField label="Start date" hint="Free-form so you can use 2025, Sep 2025, etc."><AdminInput required value={form.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)} /></AdminField>
          <AdminField label={form.educationStatus === 'in_progress' ? 'Expected completion' : 'Completion date'}><AdminInput required={form.educationStatus === 'completed'} value={form.endDate ?? ''} onChange={(e) => set('endDate', e.target.value)} /></AdminField>
        </>}
        <AdminField label="Order"><AdminInput type="number" value={form.order ?? 1} onChange={(e) => set('order', Number(e.target.value))} /></AdminField>
      </div>

      {entryType === 'certificate' && <>
        <AdminField label="Credential file" hint="PNG, JPG, WebP, AVIF or PDF · max 12 MB.">
          <div className={`credential-uploader ${uploading ? 'is-uploading' : ''}`}>
            <input ref={fileRef} className="credential-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/avif,application/pdf" onChange={(e) => uploadCredential(e.target.files?.[0])} />
            <div className="credential-upload-copy">
              <span className="credential-upload-icon">{form.imageUrl ? <FileCheck2 size={20} /> : <UploadCloud size={20} />}</span>
              <div>
                <strong>{uploading ? `Uploading · ${uploadProgress}%` : form.imageUrl ? 'Credential attached' : 'Choose a credential file'}</strong>
                <small>{form.mediaProvider === 'imagekit' ? 'Stored in your managed media library.' : 'Upload here instead of committing certificate files to GitHub.'}</small>
              </div>
            </div>
            {uploading && <span className="credential-progress"><i style={{ width: `${uploadProgress}%` }} /></span>}
          </div>
          {form.imageUrl && <div className="credential-file-actions"><a href={form.imageUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Preview attached file</a><button type="button" onClick={detachCredential}>Remove attachment</button></div>}
        </AdminField>

        <AdminField label="External credential URL / legacy path" hint="Optional. Keep this for an external verification page or old file path."><AdminInput placeholder="https://… or /certifications/…" value={form.credentialUrl ?? ''} onChange={(e) => set('credentialUrl', e.target.value)} /></AdminField>
      </>}

      <AdminField label={entryType === 'education' ? 'Description / highlights' : 'Notes / highlights'} hint="Optional context. Keep it concise and recruiter-readable."><AdminTextarea rows={5} value={form.details ?? ''} onChange={(e) => set('details', e.target.value)} /></AdminField>
      {uploadError && <p className="form-error">{uploadError}</p>}
      <label className="admin-toggle"><input type="checkbox" checked={form.visible ?? true} onChange={(e) => set('visible', e.target.checked)} /><span>Visible publicly</span></label>
      <div className="admin-save-row">{editing && <button type="button" className="admin-secondary" onClick={resetEditor}><X size={15} />Cancel</button>}<button className="admin-primary" disabled={saving || uploading}><Save size={15} />{uploading ? 'Wait for upload' : saving ? 'Saving…' : editing ? 'Update entry' : 'Create entry'}</button></div>
    </form>

    <div className="learning-admin-toolbar">
      <div className="learning-admin-summary"><span><Award size={14}/><strong>{counts.certificates}</strong> certifications</span><span><GraduationCap size={14}/><strong>{counts.education}</strong> education</span>{counts.active > 0 && <span className="is-active"><Clock3 size={14}/><strong>{counts.active}</strong> in progress</span>}</div>
      <div className="admin-filter-tabs" role="group" aria-label="Filter learning entries">
        {([['all','All'],['certificate','Certifications'],['education','Education'],['in_progress','In progress']] as [Filter,string][]).map(([value,label]) => <button type="button" key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
    </div>

    <div className="admin-list">{filteredItems.map((item) => {
      const type = learningEntryType(item);
      const institution = item.institution || item.issuer || 'Academic institution';
      return <div className="admin-list-row credential-admin-row" key={item.id}>
        {type === 'education' ? <span className="admin-learning-icon"><GraduationCap size={17}/></span> : <IssuerBadge issuer={item.issuer || 'Credential authority'} compact />}
        <div><strong>{item.name}</strong><span>{type === 'education' ? `${institution} · ${item.educationStatus === 'in_progress' ? 'In progress' : 'Completed'}` : `${item.issuer || 'Credential authority'} · ${item.date || '—'}`}</span></div>
        <div className="admin-row-meta"><span className={`admin-entry-kind ${type === 'education' ? 'education' : ''}`}>{type === 'education' ? (item.educationStatus === 'in_progress' ? <Clock3 size={12}/> : <CheckCircle2 size={12}/>) : <Award size={12}/>} {type === 'education' ? 'Education' : 'Certificate'}</span><span>{item.visible ? 'Public' : 'Hidden'}</span><button onClick={() => edit(item)}><Edit3 size={16} /></button><button className="danger" onClick={() => remove(item.id!)}><Trash2 size={16} /></button></div>
      </div>;
    })}{!filteredItems.length && <div className="admin-list-empty">No entries match this filter.</div>}</div>
  </AdminSection>;
};
