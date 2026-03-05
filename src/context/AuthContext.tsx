import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (mounted) {
                setUser(user);
                setLoading(false);
            }
        });

        // Safety timeout in case Firebase fails to initialize (e.g. missing config)
        const timeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth listener timed out - forcing app render. Check Firebase config.");
                setLoading(false);
            }
        }, 2000);

        return () => {
            mounted = false;
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-green-500 font-mono">
                <span className="animate-pulse">Initialize System...</span>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
