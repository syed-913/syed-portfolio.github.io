
import React, { useState, useEffect } from 'react';
import { getExperience, addItem, updateItem, deleteItem } from '../../services/db';
import type { Experience } from '../../types/database';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

export const ExperienceManager: React.FC = () => {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Experience>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchExperience();
    }, []);

    const fetchExperience = async () => {
        const data = await getExperience();
        setExperiences(data);
    };

    const handleEdit = (exp: Experience) => {
        setEditingId(exp.id!);
        setFormData(exp);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this experience?')) {
            await deleteItem('experience', id);
            fetchExperience();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateItem('experience', editingId, formData);
            } else {
                await addItem('experience', { ...formData, visible: true, order: experiences.length + 1 });
            }
            setEditingId(null);
            setFormData({});
            fetchExperience();
        } catch (error) {
            console.error("Error saving experience:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    // Helper to handle array inputs (description, techStack)
    const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'description' | 'techStack') => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: field === 'description'
                ? value.split('\n').filter(line => line.trim() !== '')
                : value.split(',').map(item => item.trim()).filter(item => item !== '')
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Experience List</h3>
                <button
                    onClick={() => { setEditingId(null); setFormData({}); }}
                    className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded hover:bg-primary/30 transition-colors text-sm"
                >
                    <Plus size={16} /> New Experience
                </button>
            </div>

            {/* Form */}
            <div className="bg-[#0d1117] p-6 rounded border border-white/10">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            name="role"
                            placeholder="Role / Title"
                            value={formData.role || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="company"
                            placeholder="Company"
                            value={formData.company || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="duration"
                            placeholder="Duration (e.g. 2021 - Present)"
                            value={formData.duration || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
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
                        placeholder="Description (one item per line)"
                        value={formData.description?.join('\n') || ''}
                        onChange={(e) => handleArrayChange(e, 'description')}
                        className="w-full bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none h-32"
                        required
                    />
                    <textarea
                        placeholder="Tech Stack (comma separated)"
                        value={formData.techStack?.join(', ') || ''}
                        onChange={(e) => handleArrayChange(e, 'techStack')}
                        className="w-full bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none h-20"
                        required
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
                {experiences.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-4 bg-[#161b22] border border-white/5 rounded group hover:border-white/10 transition-colors">
                        <div>
                            <h4 className="font-bold text-white">{exp.role}</h4>
                            <p className="text-xs text-gray-500">{exp.company} | {exp.duration}</p>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(exp)} className="text-blue-400 hover:text-blue-300">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(exp.id!)} className="text-red-400 hover:text-red-300">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {experiences.length === 0 && <p className="text-center text-gray-500 py-4">No experience entries found.</p>}
            </div>
        </div>
    );
};
