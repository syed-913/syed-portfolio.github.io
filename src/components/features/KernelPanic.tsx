
import React from 'react';

export const KernelPanic: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-black text-white font-mono p-4 overflow-hidden cursor-none">
            <div className="animate-pulse">
                <p className="mb-4">Kernel panic - not syncing: Fatal exception in interrupt handler</p>
                <p>PID: 1337, comm: user_session Tainted: G        W      6.5.0-generic #42-Ubuntu</p>
                <p>Call Trace:</p>
                <div className="text-gray-400 ml-4 mb-4">
                    <p>[&lt;ffffffff81001234&gt;] ? dump_stack+0x16/0x1b</p>
                    <p>[&lt;ffffffff81005678&gt;] ? panic+0xce/0x1f7</p>
                    <p>[&lt;ffffffff81009abc&gt;] ? do_exit+0x8f2/0x920</p>
                    <p>[&lt;ffffffff8100def0&gt;] ? do_group_exit+0x3a/0xa0</p>
                    <p>[&lt;ffffffff81001357&gt;] ? sys_exit_group+0x14/0x20</p>
                    <p>[&lt;ffffffff81002468&gt;] ? system_call_fastpath+0x16/0x1b</p>
                </div>
                <p className="mb-2">---[ end Kernel panic - not syncing: Attempted to kill init! ]---</p>
                <br />
                <p className="text-red-500 font-bold text-xl typing-effect">SYSTEM HALTED.</p>
                <br />
                <p className="text-sm text-gray-500 mt-20">
                    (Just kidding. Refresh the page to reboot.)
                </p>
            </div>
        </div>
    );
};
