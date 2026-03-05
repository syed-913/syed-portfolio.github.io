
export interface Project {
    id?: string;
    name: string;
    repoPath?: string;
    command: string;
    description: string;
    url: string;
    output: string;
    visible: boolean;
    order: number;
}

export interface Certificate {
    id?: string;
    name: string;
    issuer: string;
    issuerLogo?: string;
    date: string;
    imageUrl?: string; // URL from Firebase Storage or local path
    category?: 'Hard' | 'Challenging' | 'Easy';
    details?: string; // JSON string payload
    credentialId?: string;
    visible: boolean;
    order: number;
}

export interface Experience {
    id?: string;
    role: string;
    company: string;
    duration: string;
    description: string[];
    techStack: string[];
    visible: boolean;
    order: number;
}

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    date: string;
    readTime: string;
    tags: string[];
    content: string; // Markdown content
    visible: boolean;
    upvotes?: number;
    order?: number;
}

export interface ContactMessage {
    id?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    read: boolean;
}
