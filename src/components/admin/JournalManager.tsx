
import React, { useState, useEffect } from 'react';
import { getPosts, addItem, updateItem, deleteItem } from '../../services/db';
import type { BlogPost } from '../../types/database';
import { Plus, Edit, Trash2, Save, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const JournalManager: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<BlogPost>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const data = await getPosts();
        setPosts(data);
    };

    const handleEdit = (post: BlogPost) => {
        setEditingId(post.id!);
        setFormData(post);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deleteItem('posts', id);
            fetchPosts();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateItem('posts', editingId, formData);
            } else {
                await addItem('posts', { ...formData, visible: true });
            }
            setEditingId(null);
            setFormData({});
            fetchPosts();
        } catch (error) {
            console.error("Error saving post:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Auto-generate slug from title if we are setting title and haven't manually touched slug yet
            // Or simply generate it always if name is 'title' and we are creating
            if (name === 'title' && !editingId) {
                newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            // If user manually edits slug, sanitize it
            if (name === 'slug') {
                newData.slug = value.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return newData;
        });
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            tags: value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Journal Entries</h3>
                <button
                    onClick={() => { setEditingId(null); setFormData({}); }}
                    className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded hover:bg-primary/30 transition-colors text-sm"
                >
                    <Plus size={16} /> New Entry
                </button>
            </div>

            {/* Form */}
            <div className="bg-[#0d1117] p-6 rounded border border-white/10">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            name="title"
                            placeholder="Title"
                            value={formData.title || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="slug"
                            placeholder="Slug (e.g. my-first-post)"
                            value={formData.slug || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="date"
                            type="date"
                            placeholder="Date"
                            value={formData.date || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="readTime"
                            placeholder="Read Time (e.g. 5 min)"
                            value={formData.readTime || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            required
                        />
                        <input
                            name="order"
                            type="number"
                            placeholder="Order of display (Optional)"
                            value={formData.order || ''}
                            onChange={handleChange}
                            className="bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none placeholder:text-gray-600"
                        />
                    </div>
                    <input
                        name="tags"
                        placeholder="Tags (comma separated, e.g. react, tech, life)"
                        value={formData.tags?.join(', ') || ''}
                        onChange={handleTagsChange}
                        className="w-full bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <textarea
                            name="content"
                            placeholder="Write your Markdown here..."
                            value={formData.content || ''}
                            onChange={handleChange}
                            className="w-full bg-[#161b22] border border-white/10 rounded px-3 py-2 text-white focus:border-primary focus:outline-none h-96 font-mono text-sm resize-none scrollbar-thin scrollbar-thumb-white/10"
                            required
                        />
                        <div className="bg-[#161b22] border border-white/10 rounded px-4 py-3 text-white h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 prose prose-invert prose-sm max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/10">
                            {formData.content ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formData.content}
                                </ReactMarkdown>
                            ) : (
                                <span className="text-gray-500 italic font-mono text-xs">Preview will appear here...</span>
                            )}
                        </div>
                    </div>

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
                {posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-[#161b22] border border-white/5 rounded group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <FileText size={18} className="text-gray-500" />
                            <div>
                                <h4 className="font-bold text-white">{post.title}</h4>
                                <p className="text-xs text-gray-500">{post.date} | {post.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(post)} className="text-blue-400 hover:text-blue-300">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(post.id!)} className="text-red-400 hover:text-red-300">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {posts.length === 0 && <p className="text-center text-gray-500 py-4">No journal entries found.</p>}
            </div>
        </div>
    );
};
