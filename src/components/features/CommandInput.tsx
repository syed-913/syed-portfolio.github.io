
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KernelPanic } from '../features/KernelPanic';

export const CommandInput: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<React.ReactNode[]>([]);
    const [showPanic, setShowPanic] = useState(false);
    const [sudoMode, setSudoMode] = useState(false);
    const [awaitingPassword, setAwaitingPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleCommand = (cmd: string) => {
        let response: React.ReactNode = null;
        const args = cmd.trim().split(' ');
        const command = args[0].toLowerCase();

        // Handle password input for sudo mode
        if (awaitingPassword) {
            if (cmd === 'black_pearl') {
                setSudoMode(true);
                setAwaitingPassword(false);
                setOutput(prev => [
                    ...prev.slice(0, -1), // Remove the password prompt line
                    <div key={Date.now()} className="mb-2">
                        <div className="flex gap-2">
                            <span className="text-primary">user@portfolio:~$</span>
                            <span className="text-white">sudo su</span>
                        </div>
                        <div className="text-gray-300 ml-4">
                            <span className="text-gray-400">[sudo] password for user: </span>
                            <span className="text-white">{'*'.repeat(cmd.length)}</span>
                        </div>
                        <div className="text-primary font-bold mt-2">
                            🔓 Root access granted. Welcome to God Mode.
                            <br />
                            <span className="text-gray-400 text-xs">Theme: Matrix Green activated. Type 'cat /etc/shadow' for a surprise. Type 'exit' to logout.</span>
                        </div>
                    </div>
                ]);
                // Apply Matrix theme
                document.documentElement.style.setProperty('--color-primary', '#00ff41');
            } else {
                setAwaitingPassword(false);
                setOutput(prev => [
                    ...prev.slice(0, -1),
                    <div key={Date.now()} className="mb-2">
                        <div className="flex gap-2">
                            <span className="text-primary">user@portfolio:~$</span>
                            <span className="text-white">sudo su</span>
                        </div>
                        <div className="text-gray-300 ml-4">
                            <span className="text-gray-400">[sudo] password for user: </span>
                            <span className="text-white">{'*'.repeat(cmd.length)}</span>
                        </div>
                        <div className="text-red-500 mt-2">sudo: 3 incorrect password attempts</div>
                    </div>
                ]);
            }
            return;
        }

        switch (command) {
            case 'help':
                response = (
                    <div className="text-gray-400">
                        Available commands:
                        <br />
                        <span className="text-primary">about</span> - View system information
                        <br />
                        <span className="text-primary">experience</span> - View work history
                        <br />
                        <span className="text-primary">projects</span> - List active projects
                        <br />
                        <span className="text-primary">contact</span> - Initiate communication
                        <br />
                        <span className="text-primary">clear</span> - Clear terminal
                        <br />
                        <span className="text-primary">sudo</span> - Execute with root privileges (careful!)
                    </div>
                );
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'whoami':
                response = "root";
                break;
            case 'pwd':
                response = "/home/user";
                break;
            case 'ls':
                if (args.includes('-la') || args.includes('-a')) {
                    response = (
                        <div className="text-blue-400">
                            .  ..  .bashrc  .ssh  .config  active_services  available_nodes
                        </div>
                    );
                } else {
                    response = (
                        <div className="text-blue-400">
                            active_services  available_nodes
                        </div>
                    );
                }
                break;
            case 'cat':
                if (args[1] === '/etc/shadow') {
                    if (sudoMode) {
                        response = (
                            <div className="text-yellow-400">
                                <div className="mb-2">root:$6$rounds=656000$YP4barGnz...:19752:0:99999:7:::</div>
                                <div className="mb-2">daemon:*:19752:0:99999:7:::</div>
                                <div className="mb-2">bin:*:19752:0:99999:7:::</div>
                                <div className="mb-2">sys:*:19752:0:99999:7:::</div>
                                <div className="mb-2">user:$6$JustKidding$ThisIsNotReal:19752:0:99999:7:::</div>
                                <div className="mt-4 text-primary italic">
                                    Congratulations! You found the secret. 🎉<br />
                                    But did you really think I'd put real password hashes here?<br />
                                    You just wasted your time for a joke. Worth it? 😏
                                </div>
                            </div>
                        );
                    } else {
                        response = <span className="text-red-500">🚫 Permission denied. You're not root. Did you really think it would be that easy?</span>;
                    }
                } else if (args[1] === '/etc/passwd') {
                    response = <span className="text-red-500">🚫 Permission denied: Nice try, script kiddie. Go read a security book first.</span>;
                } else {
                    response = `cat: ${args[1]}: No such file or directory`;
                }
                break;
            case 'sudo':
                if (args[1] === 'su') {
                    setAwaitingPassword(true);
                    setOutput(prev => [
                        ...prev,
                        <div key={Date.now()} className="mb-2">
                            <div className="flex gap-2">
                                <span className="text-primary">user@portfolio:~$</span>
                                <span className="text-white">{cmd}</span>
                            </div>
                            <div className="text-gray-300 ml-4">
                                <span className="text-gray-400">[sudo] password for user: </span>
                            </div>
                        </div>
                    ]);
                    return;
                }
                if (args[1] === 'rm' && args[2] === '-rf' && (args[3] === '/' || args[3] === '/*')) {
                    setShowPanic(true);
                    return;
                }
                const fullCmd = args.slice(1).join(' ');
                if (fullCmd.includes('mkfs') || fullCmd.includes('dd')) {
                    response = <span className="text-red-500 font-bold">😂 LMAO! You really thought I'd let you format my disk? Go practice on your own VM, script kiddie.</span>;
                } else {
                    response = "sudo: password required (and no, it's not 'password' or 'admin')";
                }
                break;
            case ':(){:|:&};:':
            case 'forkbomb':
                response = (
                    <span className="text-yellow-500">
                        ⚠️ Fork bomb detected! Resource limit: DENIED.<br />
                        <span className="text-gray-400">Did you really think I'd let you DoS yourself? 😏</span><br />
                        <span className="text-gray-500 text-xs">(Pro tip: Don't run this on a real system unless you enjoy hard reboots)</span>
                    </span>
                );
                break;
            case 'rm':
                if (args[1] === '-rf' && (args[2] === '/' || args[2] === '/*' || args.includes('--no-preserve-root'))) {
                    setShowPanic(true);
                    return;
                }
                response = "rm: cannot remove (protection enabled by SysAdmin)";
                break;
            case 'mkfs':
            case 'dd':
                response = <span className="text-red-500 font-bold">\ud83d\udea8 System Integrity Protection: ACTIVE. Malicious command BLOCKED. Go play with fire somewhere else, hacker wannabe.</span>;
                break;
            case 'exit':
                if (sudoMode) {
                    setSudoMode(false);
                    document.documentElement.style.setProperty('--color-primary', '#00a89a');
                    response = <span className="text-gray-400">Logged out from root. Theme restored.</span>;
                } else {
                    response = "exit: not in sudo mode";
                }
                break;
            case 'cd':
                const target = args[1];
                if (target === 'about' || target === './about') navigate('/about');
                else if (target === 'experience' || target === './experience') navigate('/experience');
                else if (target === 'projects' || target === './projects') navigate('/projects');
                else if (target === 'contact' || target === './contact') navigate('/contact');
                else if (target === '..') navigate(-1);
                else response = `cd: ${target}: No such file or directory`;
                break;
            case '':
                break;
            default:
                response = `Command not found: ${command}. Type 'help' for available commands.`;
        }

        if (response) {
            setOutput(prev => [
                ...prev,
                <div key={Date.now()} className="mb-2">
                    <div className="flex gap-2">
                        <span className="text-primary">user@portfolio:~$</span>
                        <span className="text-white">{cmd}</span>
                    </div>
                    <div className="text-gray-300 ml-4">{response}</div>
                </div>
            ]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
        }
    };

    useEffect(() => {
        // Auto-focus input
        inputRef.current?.focus();
    }, [output]); // Re-focus after output updates

    if (showPanic) return <KernelPanic />;

    return (
        <div className="font-mono text-sm md:text-base mt-4 w-full" onClick={() => inputRef.current?.focus()}>
            {output}

            <div className="flex items-center gap-2">
                <span className="text-primary whitespace-nowrap">{sudoMode ? 'root@portfolio:~#' : 'user@portfolio:~$'}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none text-white w-full caret-primary"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                />
            </div>
        </div>
    );
};
