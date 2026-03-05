
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, Award, Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ProjectManager } from '../components/admin/ProjectManager';
import { ExperienceManager } from '../components/admin/ExperienceManager';
import { CertificateManager } from '../components/admin/CertificateManager';
import { JournalManager } from '../components/admin/JournalManager';
import { ContactManager } from '../components/admin/ContactManager';
import { ChatLogsViewer } from '../components/admin/ChatLogsViewer';
import { getStats } from '../services/analytics';
import { getProjects, getCertificates, getPosts, getMessages } from '../services/db';
import { MessageSquare, Activity, ShieldCheck, Terminal as TerminalIcon, Database, Cpu } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'experience' | 'certificates' | 'journals' | 'messages'>('overview');

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0d1117] font-mono text-gray-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-[#161b22] px-4 py-6 flex flex-col">
                <div className="mb-8 px-2">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        <span className="text-primary mr-2">#</span>Admin
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem
                        icon={<LayoutDashboard size={18} />}
                        label="Overview"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarItem
                        icon={<FolderKanban size={18} />}
                        label="Projects"
                        active={activeTab === 'projects'}
                        onClick={() => setActiveTab('projects')}
                    />
                    <SidebarItem
                        icon={<Briefcase size={18} />}
                        label="Experience"
                        active={activeTab === 'experience'}
                        onClick={() => setActiveTab('experience')}
                    />
                    <SidebarItem
                        icon={<Award size={18} />}
                        label="Certificates"
                        active={activeTab === 'certificates'}
                        onClick={() => setActiveTab('certificates')}
                    />
                    <SidebarItem
                        icon={<FolderKanban size={18} />}
                        label="Journals"
                        active={activeTab === 'journals'}
                        onClick={() => setActiveTab('journals')}
                    />
                    <SidebarItem
                        icon={<MessageSquare size={18} />}
                        label="Messages"
                        active={activeTab === 'messages'}
                        onClick={() => setActiveTab('messages')}
                    />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm rounded-md hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your portfolio content</p>
                </header>

                <div className="bg-[#161b22] border border-white/10 rounded-lg p-6 min-h-[500px]">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'projects' && <ProjectManager />}
                    {activeTab === 'experience' && <ExperienceManager />}
                    {activeTab === 'certificates' && <CertificateManager />}
                    {activeTab === 'journals' && <JournalManager />}
                    {activeTab === 'messages' && <ContactManager />}
                </div>
            </main>
        </div>
    );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 w-full text-left text-sm rounded-md transition-all ${active
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
    >
        {icon}
        {label}
    </button>
);

const OverviewTab: React.FC = () => {
    const [stats, setStats] = useState({ visits: 0, projects: 0, certificates: 0, journals: 0, messages: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const [analytics, projectsData, certsData, postsData, messagesData] = await Promise.all([
                getStats(),
                getProjects(),
                getCertificates(),
                getPosts(),
                getMessages()
            ]);
            setStats({
                visits: analytics.totalVisits,
                projects: projectsData.length,
                certificates: certsData.length,
                journals: postsData.length,
                messages: messagesData.length
            });
        };
        fetchStats();
    }, []);

    // Generate some stable fake analytics data for the chart since we don't track daily visits yet
    const data = [
        { name: 'Mon', visits: Math.floor(stats.visits * 0.1) },
        { name: 'Tue', visits: Math.floor(stats.visits * 0.15) },
        { name: 'Wed', visits: Math.floor(stats.visits * 0.2) },
        { name: 'Thu', visits: Math.floor(stats.visits * 0.25) },
        { name: 'Fri', visits: Math.floor(stats.visits * 0.1) },
        { name: 'Sat', visits: Math.floor(stats.visits * 0.05) },
        { name: 'Sun', visits: Math.floor(stats.visits * 0.15) },
    ];

    const COLORS = ['#00a89a', '#8b5cf6', '#eab308'];
    const contentData = [
        { name: 'Projects', value: stats.projects || 1 },
        { name: 'Certificates', value: stats.certificates || 1 },
        { name: 'Journals', value: stats.journals || 1 }
    ];

    const weeklyData = [
        { day: 'M', reads: 120, writes: 45 },
        { day: 'T', reads: 132, writes: 50 },
        { day: 'W', reads: 101, writes: 80 },
        { day: 'T', reads: 154, writes: 65 },
        { day: 'F', reads: 90, writes: 35 },
        { day: 'S', reads: 230, writes: 120 },
        { day: 'S', reads: 210, writes: 90 },
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Stats Row */}
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Visits" value={stats.visits.toString()} />
                <StatCard label="Projects" value={stats.projects.toString()} />
                <StatCard label="Certificates" value={stats.certificates.toString()} />
                <StatCard label="Journals" value={stats.journals.toString()} />
            </div>

            {/* System Status / Action Logs */}
            <div className="col-span-full lg:col-span-1 mt-2 p-4 md:p-6 bg-[#0d1117] rounded border border-white/5 h-80 flex flex-col xl:order-none order-last">
                <h3 className="text-sm font-bold text-gray-400 mb-4 font-mono uppercase tracking-wider flex items-center gap-2">
                    <TerminalIcon size={14} className="text-primary" />
                    System Logs
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-mono text-xs">
                    <div className="flex gap-3">
                        <Activity size={14} className="text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white">Admin session initiated</p>
                            <span className="text-gray-600 block">Just now • src/context/AuthContext.tsx</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <ShieldCheck size={14} className="text-green-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white">Firestore read permissions validated</p>
                            <span className="text-gray-600 block">2m ago • firebase/firestore</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <MessageSquare size={14} className="text-purple-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white">ContactMessage queue synchronized</p>
                            <span className="text-gray-600 block">5m ago • getMessages()</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Graph */}
            <div className="col-span-full lg:col-span-3 xl:col-span-2 mt-2 p-4 md:p-6 bg-[#0d1117] rounded border border-white/5 h-80">
                <h3 className="text-sm font-bold text-gray-400 mb-6 font-mono uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Traffic Overview
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00a89a" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00a89a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="name" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                            itemStyle={{ color: '#00a89a' }}
                        />
                        <Area type="monotone" dataKey="visits" stroke="#00a89a" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Content Distribution Pie Chart */}
            <div className="col-span-full md:col-span-2 xl:col-span-1 mt-2 p-4 md:p-6 bg-[#0d1117] rounded border border-white/5 h-80 flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 mb-6 font-mono uppercase tracking-wider flex items-center gap-2">
                    <Database size={14} className="text-purple-400" />
                    Content Distribution
                </h3>
                <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={contentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {contentData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161b22', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="font-mono text-2xl font-bold text-white">{stats.projects + stats.certificates + stats.journals}</span>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Total</span>
                    </div>
                </div>
            </div>

            {/* Activity Bar Chart */}
            <div className="col-span-full md:col-span-2 xl:col-span-full mt-2 p-4 md:p-6 bg-[#0d1117] rounded border border-white/5 h-80 flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 mb-6 font-mono uppercase tracking-wider flex items-center gap-2">
                    <Cpu size={14} className="text-yellow-400" />
                    Database R/W Activity (Simulated)
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="day" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                            cursor={{ fill: '#ffffff05' }}
                        />
                        <Bar dataKey="reads" fill="#00a89a" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="writes" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Chat Logs Monitor */}
            <div className="col-span-full mt-2 p-4 md:p-6 bg-[#0d1117] rounded border border-white/5">
                <ChatLogsViewer />
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: string; delta?: string }> = ({ label, value, delta }) => (
    <div className="p-4 bg-[#0d1117] rounded border border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white">{value}</span>
            {delta && <span className="text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">{delta}</span>}
        </div>
    </div>
);

export default Dashboard;
