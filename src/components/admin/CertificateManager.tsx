
import React, { useState, useEffect } from 'react';
import { getCertificates, addItem, updateItem, deleteItem } from '../../services/db';
import type { Certificate } from '../../types/database';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

const certFiles = import.meta.glob('/public/certifications/*.{png,jpg,jpeg,webp}', { query: '?url', import: 'default', eager: true });
const availableCertImages = Object.keys(certFiles);

const logoFiles = import.meta.glob('/public/logo/*.{png,jpg,jpeg,webp,svg}', { query: '?url', import: 'default', eager: true });
const availableLogoImages = Object.keys(logoFiles);

export const CertificateManager: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Certificate>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        const data = await getCertificates();
        setCertificates(data);
    };

    const handleEdit = (cert: Certificate) => {
        setEditingId(cert.id!);
        setFormData(cert);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this certificate?')) {
            await deleteItem('certificates', id);
            fetchCertificates();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateItem('certificates', editingId, formData);
            } else {
                await addItem('certificates', { ...formData, visible: true, order: certificates.length + 1 });
            }
            setEditingId(null);
            setFormData({});
            fetchCertificates();
        } catch (error) {
            console.error("Error saving certificate:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Certificate List</h3>
                <button
                    onClick={() => { setEditingId(null); setFormData({}); }}
                    className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded hover:bg-primary/30 transition-colors text-sm"
                >
                    <Plus size={16} /> New Certificate
                </button>
            </div>

            {/* Form */}
            <div className="bg-[#0d1117] p-6 rounded border border-white/10">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            name="name"
                            placeholder="Certificate Name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="issuer"
                            placeholder="Issuer (e.g. Red Hat)"
                            value={formData.issuer || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="date"
                            placeholder="Date (e.g. 2024)"
                            value={formData.date || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="credentialId"
                            placeholder="Credential ID (Optional)"
                            value={formData.credentialId || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                        <div className="flex flex-col gap-2">
                            <select
                                name="imageUrl"
                                value={formData.imageUrl || ''}
                                onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                                className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            >
                                <option value="">-- Select Cert Image --</option>
                                {availableCertImages.map(img => (
                                    <option key={img} value={img}>{img.split('/').pop()}</option>
                                ))}
                            </select>
                            <input
                                name="imageUrl"
                                placeholder="Or enter custom URL"
                                value={formData.imageUrl || ''}
                                onChange={handleChange}
                                className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <select
                                name="issuerLogo"
                                value={formData.issuerLogo || ''}
                                onChange={(e) => setFormData(p => ({ ...p, issuerLogo: e.target.value }))}
                                className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            >
                                <option value="">-- Select Logo Image --</option>
                                {availableLogoImages.map(img => (
                                    <option key={img} value={img}>{img.split('/').pop()}</option>
                                ))}
                            </select>
                            <input
                                name="issuerLogo"
                                placeholder="Or enter custom Logo URL"
                                value={formData.issuerLogo || ''}
                                onChange={handleChange}
                                className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none text-sm"
                            />
                        </div>
                        <select
                            name="category"
                            value={formData.category || ''}
                            onChange={(e) => setFormData(p => ({ ...p, category: e.target.value as any }))}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        >
                            <option value="">-- Select Category (Optional) --</option>
                            <option value="Easy">Easy</option>
                            <option value="Challenging">Challenging</option>
                            <option value="Hard">Hard</option>
                        </select>
                        <input
                            name="order"
                            type="number"
                            placeholder="Order of display"
                            value={formData.order || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none placeholder:text-gray-600"
                        />
                    </div>

                    <textarea
                        name="details"
                        placeholder='Certificate Metadata (JSON format) e.g. {"valid": true, "score": "95%"}'
                        value={formData.details || ''}
                        onChange={(e) => setFormData(p => ({ ...p, details: e.target.value }))}
                        className="w-full bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none font-mono text-xs h-24"
                    />

                    <div className="flex justify-end gap-3">
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setFormData({}); }}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : <><Save size={16} /> {editingId ? 'Update' : 'Create'}</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-3">
                {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 bg-[#161b22] border border-white/5 rounded group hover:border-white/10 transition-colors">
                        <div>
                            <h4 className="font-bold text-white">{cert.name}</h4>
                            <p className="text-xs text-gray-500">{cert.issuer} | {cert.date}</p>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(cert)} className="text-blue-400 hover:text-blue-300">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(cert.id!)} className="text-red-400 hover:text-red-300">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {certificates.length === 0 && <p className="text-center text-gray-500 py-4">No certificates found.</p>}
            </div>
        </div>
    );
};
