import { useEffect, useRef, useState } from 'react';
import { Edit3, ExternalLink, FileCheck2, Plus, Save, Trash2, UploadCloud, X } from 'lucide-react';
import { addItem, deleteItem, getCertificates, updateItem } from '../../services/db';
import { deleteCredentialMedia, uploadCredentialMedia } from '../../lib/media';
import type { Certificate } from '../../types/database';
import { IssuerBadge } from '../ui/IssuerBadge';
import { AdminField, AdminInput, AdminSection, AdminSelect, AdminTextarea } from './AdminUI';

const empty: Partial<Certificate> = {
  name: '', issuer: '', date: '', credentialId: '', imageUrl: '', mediaFileId: '', mediaProvider: undefined,
  category: undefined, details: '', visible: true, order: 1,
};
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'application/pdf']);

const publicPayload = (form: Partial<Certificate>) => {
  const { issuerLogo, ...payload } = form;
  void issuerLogo;
  return payload;
};

export const CertificateManager = () => {
  const [items, setItems] = useState<Certificate[]>([]);
  const [form, setForm] = useState<Partial<Certificate>>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => getCertificates().then(setItems);
  useEffect(() => { refresh(); }, []);
  const set = (key: keyof Certificate, value: any) => setForm((previous) => ({ ...previous, [key]: value }));
  const savedItem = () => editing ? items.find((item) => item.id === editing) : undefined;

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
    if (!file) return;
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
        // New uploads no longer use Firebase Storage. Keep the legacy field empty going forward.
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
    setSaving(true);
    const previous = editing ? items.find((item) => item.id === editing) : undefined;
    try {
      const payload = publicPayload(form);
      if (editing) await updateItem('certificates', editing, payload);
      else await addItem('certificates', { ...payload, order: form.order ?? items.length + 1, visible: form.visible ?? true });

      if (previous?.mediaProvider === 'imagekit' && previous.mediaFileId && previous.mediaFileId !== form.mediaFileId) {
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
    if (!confirm('Delete this credential?')) return;
    await deleteItem('certificates', id);
    if (item?.mediaProvider === 'imagekit' && item.mediaFileId) {
      deleteCredentialMedia(item.mediaFileId).catch(() => undefined);
    }
    refresh();
  };

  const edit = async (item: Certificate) => {
    await removeUncommittedUpload();
    setEditing(item.id!);
    setForm(item);
    setUploadError('');
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  return <AdminSection
    title="Credentials"
    description="Upload certificate images or PDFs directly from the dashboard. Files stay outside the Git repository, while issuer identity remains automatic."
    action={<button className="admin-secondary" onClick={resetEditor}><Plus size={15} /> New</button>}
  >
    <form onSubmit={save} className="admin-editor-card">
      <div className="admin-form-grid">
        <AdminField label="Name"><AdminInput required value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} /></AdminField>
        <AdminField label="Issuer"><div className="admin-issuer-field"><AdminInput required placeholder="e.g. Amazon Web Services" value={form.issuer ?? ''} onChange={(e) => set('issuer', e.target.value)} />{form.issuer?.trim() && <IssuerBadge issuer={form.issuer} compact withLabel />}</div></AdminField>
        <AdminField label="Date"><AdminInput required value={form.date ?? ''} onChange={(e) => set('date', e.target.value)} /></AdminField>
        <AdminField label="Credential ID"><AdminInput value={form.credentialId ?? ''} onChange={(e) => set('credentialId', e.target.value)} /></AdminField>
        <AdminField label="Category"><AdminSelect value={form.category ?? ''} onChange={(e) => set('category', e.target.value || undefined)}><option value="">Uncategorized</option><option>Easy</option><option>Challenging</option><option>Hard</option></AdminSelect></AdminField>
        <AdminField label="Order"><AdminInput type="number" value={form.order ?? 1} onChange={(e) => set('order', Number(e.target.value))} /></AdminField>
      </div>

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
        {uploadError && <p className="form-error">{uploadError}</p>}
        {form.imageUrl && <div className="credential-file-actions"><a href={form.imageUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Preview attached file</a><button type="button" onClick={detachCredential}>Remove attachment</button></div>}
      </AdminField>

      <AdminField label="External credential URL / legacy path" hint="Optional. Keep this only for an existing external credential page or old file path."><AdminInput placeholder="https://… or /certifications/…" value={form.credentialUrl ?? ''} onChange={(e) => set('credentialUrl', e.target.value)} /></AdminField>
      <AdminField label="Optional metadata (JSON)"><AdminTextarea rows={5} value={form.details ?? ''} onChange={(e) => set('details', e.target.value)} /></AdminField>
      <label className="admin-toggle"><input type="checkbox" checked={form.visible ?? true} onChange={(e) => set('visible', e.target.checked)} /><span>Visible publicly</span></label>
      <div className="admin-save-row">{editing && <button type="button" className="admin-secondary" onClick={resetEditor}><X size={15} />Cancel</button>}<button className="admin-primary" disabled={saving || uploading}><Save size={15} />{uploading ? 'Wait for upload' : saving ? 'Saving…' : editing ? 'Update credential' : 'Create credential'}</button></div>
    </form>

    <div className="admin-list">{items.map((item) => <div className="admin-list-row credential-admin-row" key={item.id}><IssuerBadge issuer={item.issuer} compact /><div><strong>{item.name}</strong><span>{item.issuer} · {item.date}</span></div><div className="admin-row-meta"><span>{item.visible ? 'Public' : 'Hidden'}</span><button onClick={() => edit(item)}><Edit3 size={16} /></button><button className="danger" onClick={() => remove(item.id!)}><Trash2 size={16} /></button></div></div>)}</div>
  </AdminSection>;
};
