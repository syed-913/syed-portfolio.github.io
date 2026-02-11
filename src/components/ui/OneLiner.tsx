
import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const facts = [
    "sudo make me a sandwich",
    "rm -rf / is not a backup strategy",
    "It works on my machine",
    "Have you tried turning it off and on again?",
    "There is no place like ~",
    "git push --force is the dark side of the force",
    "Docker: Works on my machine, now works on yours",
    "chmod 777 is evil, but necessary sometimes",
    ":wq! saves lives",
    "Warning: Coffee dependency not found",
    "I rewrite code so I don't have to rewrite comments",
    "Simplicity is the ultimate sophistication",
    "Code never lies, comments do",
    "Linux is free if your time is free",
    "Real programmers count from 0",
    "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
    "In a world of proprietary software, be Open Source",
    "Tabs vs Spaces: The never-ending war",
    "To err is human, to git revert divine",
    "One does not simply merge to master",
    "I am root",
    "Keep calm and sudo apt-get update",
    "Ping is not a strategy",
    "Documentation is key, but nobody reads it",
    "The cloud is just someone else's computer",
    "uptime: 99.999% (in my dreams)",
    "grep is your friend",
    "sed -i 's/bug/feature/g'",
    "640K ought to be enough for anybody",
    "Things aren't always #000000 and #FFFFFF"
];

export const OneLiner: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % facts.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 text-xs md:text-sm font-mono text-gray-500 mt-8 opacity-70 hover:opacity-100 transition-opacity">
            <Terminal size={14} className="text-primary shrink-0" />
            <span className="text-primary">fact:</span>
            <span className="italic truncate">{facts[index]}</span>
        </div>
    );
};
