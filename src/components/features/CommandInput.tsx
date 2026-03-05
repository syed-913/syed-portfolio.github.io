

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { KernelPanic } from '../features/KernelPanic';

export const CommandInput: React.FC = () => {
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<React.ReactNode[]>([]);
    const [showPanic, setShowPanic] = useState(false);
    const [sudoMode, setSudoMode] = useState(false);
    const [neoMode, setNeoMode] = useState(false);
    const [awaitingPassword, setAwaitingPassword] = useState(false);
    const [awaitingSSHPassphrase, setAwaitingSSHPassphrase] = useState(false);
    const [awaitingAccessKey, setAwaitingAccessKey] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Determine current prompt for history
    const getBasePrompt = () => {
        if (neoMode) return 'neo@portfolio:~$';
        if (user) return 'admin@portfolio:~#'; // Show admin prompt if logged in
        if (sudoMode) return 'root@portfolio:~#';
        return 'user@portfolio:~$';
    };

    // Determine current active input prompt
    const getActivePrompt = () => {
        if (awaitingAccessKey) return 'Enter Access Key: ';
        if (awaitingSSHPassphrase) return "neo@portfolio's passphrase: ";
        if (awaitingPassword) return '[sudo] password for user: ';
        return getBasePrompt() + ' ';
    };

    const handleCommand = async (cmd: string) => {
        let response: React.ReactNode = null;
        const args = cmd.trim().split(' ');
        const command = args[0].toLowerCase();
        const currentPrompt = getBasePrompt();

        // Handle Access Key for Firebase Login
        if (awaitingAccessKey) {
            setAwaitingAccessKey(false);
            // Hidden Hardcoded Admin Email - User triggers strict security flow
            const adminEmail = "syedammar06@proton.me";

            setOutput(prev => [
                ...prev.slice(0, -1),
                <div key={Date.now()} className="mb-2">
                    <div className="flex gap-2">
                        <span className="text-primary">{currentPrompt}</span>
                        <span className="text-white">login</span>
                    </div>
                    <div className="text-gray-300 ml-4">
                        <span className="text-gray-400">Enter Access Key: </span>
                        <span className="text-white">{'*'.repeat(cmd.length)}</span>
                    </div>
                    <div className="text-gray-400 ml-4 mt-1">Verifying credentials with secure mainframe...</div>
                </div>
            ]);

            try {
                await signInWithEmailAndPassword(auth, adminEmail, cmd);
                setOutput(prev => [
                    ...prev,
                    <div key={Date.now() + 1} className="text-[#00ff41] font-bold ml-4 mt-2">
                        🔓 ACCESS GRANTED. Welcome back, Administrator.
                    </div>
                ]);
            } catch (error) {
                setOutput(prev => [
                    ...prev,
                    <div key={Date.now() + 1} className="text-red-500 font-bold ml-4 mt-2">
                        🚫 ACCESS DENIED. Invalid credentials.
                    </div>
                ]);
            }
            return;
        }

        // Handle SSH passphrase input
        if (awaitingSSHPassphrase) {
            if (cmd === 'what_a_pity_that_I_am_not_an_honest_man!') {
                setNeoMode(true);
                setAwaitingSSHPassphrase(false);
                setOutput(prev => [
                    ...prev.slice(0, -1),
                    <div key={Date.now()} className="mb-2">
                        <div className="flex gap-2">
                            <span className="text-primary">{currentPrompt}</span>
                            <span className="text-white">ssh neo@portfolio</span>
                        </div>
                        <div className="text-gray-400 ml-4 mb-1">Connecting to neo@portfolio...</div>
                        <div className="text-gray-300 ml-4">
                            <span className="text-gray-400">neo@portfolio's passphrase: </span>
                            <span className="text-white">{'•'.repeat(cmd.length)}</span>
                        </div>
                        <div className="mt-3 ml-4 space-y-1">
                            <div className="text-[#00ff41] font-bold">🔓 Access granted.</div>
                            <div className="text-[#00ff41] font-mono text-xs leading-relaxed">
                                Wake up, Neo...<br />
                                The Matrix has you...<br />
                                Follow the white rabbit. 🐇
                            </div>
                            <div className="text-gray-500 text-xs mt-2">
                                Prompt changed to neo@portfolio. Type 'ls' to look around. Type 'exit' to disconnect.
                            </div>
                        </div>
                    </div>
                ]);
            } else {
                setAwaitingSSHPassphrase(false);
                setOutput(prev => [
                    ...prev.slice(0, -1),
                    <div key={Date.now()} className="mb-2">
                        <div className="flex gap-2">
                            <span className="text-primary">{currentPrompt}</span>
                            <span className="text-white">ssh neo@portfolio</span>
                        </div>
                        <div className="text-gray-400 ml-4 mb-1">Connecting to neo@portfolio...</div>
                        <div className="text-gray-300 ml-4">
                            <span className="text-gray-400">neo@portfolio's passphrase: </span>
                            <span className="text-white">{'•'.repeat(cmd.length)}</span>
                        </div>
                        <div className="text-red-500 mt-2 ml-4">Permission denied (publickey,keyboard-interactive).</div>
                        <div className="text-gray-600 text-xs ml-4 mt-1">Hint: The answer is hidden in the source... 👀</div>
                    </div>
                ]);
            }
            return;
        }

        // Handle password input for sudo mode
        if (awaitingPassword) {
            if (cmd === 'black_pearl') {
                setSudoMode(true);
                setAwaitingPassword(false);
                document.body.classList.add('theme-violet');
                setOutput(prev => [
                    ...prev.slice(0, -1),
                    <div key={Date.now()} className="mb-2">
                        <div className="flex gap-2">
                            <span className="text-primary">{currentPrompt}</span>
                            <span className="text-white">sudo su</span>
                        </div>
                        <div className="text-gray-300 ml-4">
                            <span className="text-gray-400">[sudo] password for user: </span>
                            <span className="text-white">{'*'.repeat(cmd.length)}</span>
                        </div>
                        <div className="text-primary font-bold mt-2">
                            🔓 Root access granted. Welcome to God Mode.
                            <br />
                            <span className="text-gray-400 text-xs">Theme: Violet activated. Type 'cat /etc/shadow' for a surprise. Type 'exit' to logout.</span>
                        </div>
                    </div>
                ]);
            } else {
                setAwaitingPassword(false);
                setOutput(prev => [
                    ...prev.slice(0, -1),
                    <div key={Date.now()} className="mb-2">
                        <div className="flex gap-2">
                            <span className="text-primary">{currentPrompt}</span>
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
                        <br />
                        <span className="text-primary">ssh</span> - Secure shell connection
                        <br />
                        <span className="text-primary">exit</span> - Exit current mode or logout
                    </div>
                );
                break;
            case 'login':
                if (user) {
                    response = <span className="text-yellow-400">Already logged in as Administrator.</span>;
                } else {
                    setAwaitingAccessKey(true);
                    setOutput(prev => [
                        ...prev,
                        <div key={Date.now()} className="mb-2">
                            <div className="flex gap-2">
                                <span className="text-primary">{currentPrompt}</span>
                                <span className="text-white">{cmd}</span>
                            </div>
                            <div className="text-gray-300 ml-4">
                                <span className="text-gray-400">Enter Access Key: </span>
                            </div>
                        </div>
                    ]);
                    return;
                }
                break;
            case 'logout':
                if (user) {
                    await signOut(auth);
                    response = <span className="text-gray-400">Logged out successfully. Session terminated.</span>;
                } else {
                    response = "logout: not logged in";
                }
                break;
            case 'clear':
                setOutput([]);
                return;
            case 'whoami':
                response = user ? 'admin' : (neoMode ? 'neo' : (sudoMode ? 'root' : 'user'));
                break;
            case 'pwd':
                response = neoMode ? '/home/neo' : '/home/user';
                break;
            case 'ls':
                if (neoMode) {
                    response = (
                        <div className="text-[#00ff41] font-mono">
                            <span className="text-gray-500">drwxr-xr-x</span> <span className="text-blue-400">.matrix/</span>{'     '}
                            <span className="text-gray-500">drwxr-xr-x</span> <span className="text-blue-400">.rabbit_hole/</span><br />
                            <span className="text-gray-500">-rw-r--r--</span> <span className="text-white">secret.txt</span>{'    '}
                            <span className="text-gray-500">-rwxr-xr-x</span> <span className="text-[#00ff41]">red_pill.sh</span><br />
                            <span className="text-gray-500">-rwxr-xr-x</span> <span className="text-[#00ff41]">blue_pill.sh</span>
                        </div>
                    );
                } else if (args.includes('-la') || args.includes('-a')) {
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
                if (neoMode && args[1] === 'secret.txt') {
                    response = (
                        <div className="text-[#00ff41] font-mono text-xs md:text-sm leading-relaxed">
                            <pre className="whitespace-pre overflow-x-auto">
                                {`┌──────────────────────────────────────────────┐
│                                              │
│  You thought you were The One?               │
│  Sorry Neo, you're just another visitor      │
│  who reads source code comments.             │
│                                              │
│  Skills acquired:                            │
│    ✓ Ctrl+U → Read HTML comments             │
│    ✓ Found a hidden SSH key (wow, so cool)   │
│    ✓ Typed a passphrase you found online     │
│                                              │
│  Clearance Level: Script Kiddie (Level 1)    │
│                                              │
│  The Matrix has you... but so does my        │
│  analytics. I saw you coming. 👀             │
│                                              │
│  Try 'cat red_pill.sh' if you dare.          │
│                                              │
└──────────────────────────────────────────────┘`}
                            </pre>
                        </div>
                    );
                } else if (neoMode && (args[1] === 'red_pill.sh' || args[1] === './red_pill.sh')) {
                    response = (
                        <div className="text-red-400 font-mono text-sm">
                            <div className="text-gray-500 mb-2">#!/bin/bash</div>
                            <div className="text-gray-500 mb-2"># The truth you weren't ready for:</div>
                            <div className="mb-3 text-red-300 leading-relaxed">
                                echo "Vim {'>'} VS Code"<br />
                                echo "That's not an opinion. That's a syscall."<br />
                                echo ""<br />
                                echo "While you were dragging and dropping files,"<br />
                                echo "real sysadmins were writing configs in Vim"<br />
                                echo "on a machine with no GUI. Over SSH."<br />
                                echo "On a Friday. During an outage. In prod."<br />
                            </div>
                            <div className="text-gray-500 mt-2"># You've seen the truth. There's no going back now.</div>
                            <div className="text-gray-500"># Or just type 'cat blue_pill.sh' to forget everything.</div>
                        </div>
                    );
                } else if (neoMode && (args[1] === 'blue_pill.sh' || args[1] === './blue_pill.sh')) {
                    response = (
                        <div className="text-blue-400 font-mono text-sm">
                            <div className="text-gray-500 mb-2">#!/bin/bash</div>
                            <div className="text-gray-500 mb-2"># You chose the blue pill.</div>
                            <div className="mb-3 text-blue-300 leading-relaxed">
                                echo "You stay in Wonderland, and I show you"<br />
                                echo "how deep the portfolio goes..."<br />
                                echo ""<br />
                                echo "Redirecting to ./projects..."<br />
                            </div>
                            <div className="text-gray-500 mt-2"># Ignorance is bliss. But my projects are better.</div>
                            <div className="mt-3">
                                <span
                                    className="text-primary underline cursor-pointer hover:text-white transition-colors"
                                    onClick={() => navigate('/projects')}
                                >
                                    → Click here to see the projects (or type 'cd projects')
                                </span>
                            </div>
                        </div>
                    );
                } else if (args[1] === '/etc/shadow') {
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
                    response = `cat: ${args[1] || '(missing argument)'}: No such file or directory`;
                }
                break;
            case 'ssh':
                if (args[1] === 'neo@portfolio') {
                    if (neoMode) {
                        response = <span className="text-yellow-400">Already connected as neo. You're already in the Matrix.</span>;
                    } else {
                        setAwaitingSSHPassphrase(true);
                        setOutput(prev => [
                            ...prev,
                            <div key={Date.now()} className="mb-2">
                                <div className="flex gap-2">
                                    <span className="text-primary">{currentPrompt}</span>
                                    <span className="text-white">{cmd}</span>
                                </div>
                                <div className="text-gray-400 ml-4 mb-1">Connecting to neo@portfolio...</div>
                                <div className="text-gray-300 ml-4">
                                    <span className="text-gray-400">neo@portfolio's passphrase: </span>
                                </div>
                            </div>
                        ]);
                        return;
                    }
                } else if (args[1]) {
                    response = <span className="text-red-500">ssh: Could not resolve hostname {args[1]}: Name or service not known</span>;
                } else {
                    response = 'usage: ssh [user@]hostname';
                }
                break;
            case 'sudo':
                if (neoMode) {
                    response = <span className="text-[#00ff41]">Neo doesn't need sudo. Neo IS the system.</span>;
                    break;
                }
                if (args[1] === 'su') {
                    setAwaitingPassword(true);
                    setOutput(prev => [
                        ...prev,
                        <div key={Date.now()} className="mb-2">
                            <div className="flex gap-2">
                                <span className="text-primary">{currentPrompt}</span>
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
                response = <span className="text-red-500 font-bold">🚨 System Integrity Protection: ACTIVE. Malicious command BLOCKED. Go play with fire somewhere else, hacker wannabe.</span>;
                break;
            case 'exit':
                if (neoMode) {
                    setNeoMode(false);
                    response = (
                        <div className="text-gray-400">
                            <span className="text-[#00ff41]">Connection to neo@portfolio closed.</span><br />
                            <span className="text-gray-500 text-xs">You've returned to the real world. But you'll be back... they always come back.</span>
                        </div>
                    );
                } else if (sudoMode) {
                    setSudoMode(false);
                    document.body.classList.remove('theme-violet');
                    response = <span className="text-gray-400">Logged out from root. Theme restored.</span>;
                } else {
                    response = "exit: not in a session";
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
                        <span className="text-primary">{currentPrompt}</span>
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
        inputRef.current?.focus();
    }, [output]);

    if (showPanic) return <KernelPanic />;

    return (
        <div className="font-mono text-sm md:text-base mt-4 w-full" onClick={() => inputRef.current?.focus()}>
            {output}

            <div className="flex items-center gap-2">
                <span className={`whitespace-nowrap ${(awaitingAccessKey || awaitingSSHPassphrase || awaitingPassword)
                    ? 'text-gray-400'
                    : neoMode ? 'text-[#00ff41]' : 'text-primary'
                    }`}>{getActivePrompt()}</span>
                <input
                    ref={inputRef}
                    type={awaitingPassword || awaitingSSHPassphrase || awaitingAccessKey ? 'password' : 'text'}
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

