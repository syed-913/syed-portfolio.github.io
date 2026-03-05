
import React from 'react';
import { Link } from 'react-router-dom';
import { Power, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
    return (
        <div className="bg-[#221010] min-h-screen flex flex-col font-mono overflow-x-hidden selection:bg-red-500 selection:text-white relative z-50">

            {/* CRT Overlay Layer */}
            <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
            <div className="fixed inset-0 pointer-events-none z-50 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>

            {/* Vignette */}
            <div className="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>

            <div className="flex h-full grow flex-col relative z-10 p-4 md:p-8 lg:p-12 animate-[pulse_0.15s_infinite] opacity-98">

                {/* Boot Messages */}
                <div className="w-full max-w-[1200px] mx-auto mb-8">
                    <div className="flex flex-col gap-1 text-sm md:text-base opacity-75 font-mono">
                        <p className="text-[#ba9c9c] leading-tight">[ 0.000000] Linux version 4.0.4-generic (root@server) (gcc version 9.3.0)</p>
                        <p className="text-[#ba9c9c] leading-tight">[ 0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-4.0.4 root=UUID=404 ro quiet splash</p>
                        <p className="text-[#ba9c9c] leading-tight">[ 0.000212] MEMORY_ERROR: Address 0xDEADBEEF not found</p>
                    </div>
                </div>

                {/* Kernel Panic Header */}
                <div className="w-full max-w-[1200px] mx-auto mb-8">
                    <div className="border-l-4 border-red-600 pl-4 py-2 bg-red-900/20">
                        <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-wide font-mono">
                            ---[ end Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(404,404) ]---
                        </h1>
                    </div>
                </div>

                {/* Stack Trace & Error Visual */}
                <div className="w-full max-w-[1200px] mx-auto flex-1 flex flex-col lg:flex-row gap-12">

                    {/* Left Column: Code Trace */}
                    <div className="flex-1 font-mono text-sm md:text-base text-gray-400 space-y-2 opacity-90 overflow-hidden">
                        <p className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">Call Trace:</p>
                        <div className="space-y-1 pl-2 border-l border-gray-800">
                            <p className="hover:text-white transition-colors cursor-text">[&lt;ffffffff810&gt;] ? find_page+0x404/0x500</p>
                            <p className="hover:text-white transition-colors cursor-text">[&lt;ffffffff811&gt;] ? lookup_url_failed+0x20/0x40</p>
                            <p className="hover:text-white transition-colors cursor-text">[&lt;ffffffff812&gt;] ? navigation_route_missing+0x10/0x20</p>
                            <p className="hover:text-white transition-colors cursor-text">[&lt;ffffffff813&gt;] ? panic+0xdead/0xbeef</p>
                            <p className="hover:text-white transition-colors cursor-text">[&lt;ffffffff814&gt;] ? system_halt+0x00/0xff</p>
                            <p className="mt-4 text-red-500/80 break-all">Code: f2 0d 0d 40 40 40 40 00 00 00 00 00 00 00 00 ff ff ff ff 41 41 41 41 4c 49 4e 55 58 ...</p>
                        </div>
                        <div className="mt-8 opacity-50 text-xs">
                            <p>&gt; _waiting for input...</p>
                        </div>
                    </div>

                    {/* Right Column: Error Visual */}
                    <div className="flex-1 flex flex-col items-center justify-center py-8">
                        <div className="w-full max-w-md relative group">
                            {/* Glitch effect background */}
                            <div className="absolute -inset-1 bg-red-600/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-red-600 bg-[#1a0c0c] px-8 py-12 shadow-[0_0_50px_rgba(242,13,13,0.1)]">
                                <AlertTriangle className="w-20 h-20 text-red-600 animate-pulse drop-shadow-[0_0_8px_rgba(242,13,13,0.8)]" />
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <p className="text-red-600 text-5xl font-bold leading-none tracking-tighter drop-shadow-[0_0_8px_rgba(242,13,13,0.8)]">ERROR 404</p>
                                    <div className="h-px w-full bg-red-600/30 my-2"></div>
                                    <p className="text-white/90 text-lg font-mono">Critical Process Died</p>
                                    <p className="text-gray-500 text-sm">The requested resource could not be located in the memory map.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer / Action */}
                <div className="w-full max-w-[1200px] mx-auto mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-red-600 animate-pulse"></span>
                            <p className="text-white text-base md:text-lg font-mono">System halted.</p>
                        </div>
                        <Link
                            to="/"
                            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-transparent border border-white/20 hover:border-red-600 hover:bg-red-900/10 rounded-sm transition-all duration-200"
                        >
                            <Power className="w-5 h-5 text-white group-hover:text-red-600 transition-colors" />
                            <span className="text-white font-mono font-bold tracking-wider group-hover:text-red-600 transition-colors">[REBOOT]</span>

                            {/* Decorative corner accents */}
                            <div className="absolute top-0 left-0 w-1 h-1 bg-white group-hover:bg-red-600 transition-colors"></div>
                            <div className="absolute top-0 right-0 w-1 h-1 bg-white group-hover:bg-red-600 transition-colors"></div>
                            <div className="absolute bottom-0 left-0 w-1 h-1 bg-white group-hover:bg-red-600 transition-colors"></div>
                            <div className="absolute bottom-0 right-0 w-1 h-1 bg-white group-hover:bg-red-600 transition-colors"></div>
                        </Link>
                    </div>
                    <p className="text-center md:text-right mt-2 text-xs text-gray-600 font-mono uppercase">Press [REBOOT] to return to home</p>
                </div>

            </div>
        </div>
    );
};

export default NotFound;
