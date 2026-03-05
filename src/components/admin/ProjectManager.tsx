
import React, { useState, useEffect } from 'react';
import { getProjects, addItem, updateItem, deleteItem } from '../../services/db';
import type { Project } from '../../types/database';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

export const ProjectManager: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Project>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        const data = await getProjects();
        setProjects(data);
    };

    const handleEdit = (project: Project) => {
        setEditingId(project.id!);
        setFormData(project);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteItem('projects', id);
            fetchProjects();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateItem('projects', editingId, formData);
            } else {
                await addItem('projects', { ...formData, visible: true, order: projects.length + 1 });
            }
            setEditingId(null);
            setFormData({});
            fetchProjects();
        } catch (error) {
            console.error("Error saving project:", error);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Project List</h3>
                <button
                    onClick={() => { setEditingId(null); setFormData({}); }}
                    className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded hover:bg-primary/30 transition-colors text-sm"
                >
                    <Plus size={16} /> New Project
                </button>
            </div>

            {/* Form */}
            <div className="bg-[#0d1117] p-6 rounded border border-white/10">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            name="name"
                            placeholder="Project Name (slug)"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="command"
                            placeholder="Command (e.g. tree .)"
                            value={formData.command || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="url"
                            placeholder="GitHub URL"
                            value={formData.url || ''}
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
                        name="description"
                        placeholder="Description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="w-full bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none h-20"
                        required
                    />
                    <textarea
                        name="output"
                        placeholder="HTML Output (Terminal visual)"
                        value={formData.output || ''}
                        onChange={handleChange}
                        className="w-full bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none h-32 font-mono text-xs"
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
                {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-[#161b22] border border-white/5 rounded group hover:border-white/10 transition-colors">
                        <div>
                            <h4 className="font-bold text-white">{project.name}</h4>
                            <p className="text-xs text-gray-500">{project.url}</p>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(project)} className="text-blue-400 hover:text-blue-300">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(project.id!)} className="text-red-400 hover:text-red-300">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && <p className="text-center text-gray-500 py-4">No projects found.</p>}
            </div>
        </div>
    );
};
