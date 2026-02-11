import { useEffect, useState } from 'react';

export const CursorGlow: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleFocusIn = (e: FocusEvent) => {
            // Hide glow when focusing on input/textarea elements
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                setIsVisible(false);
            }
        };

        const handleFocusOut = (e: FocusEvent) => {
            // Show glow when unfocusing from input/textarea elements
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                setIsVisible(true);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-500"
            style={{
                opacity: isVisible ? 1 : 0,
                background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 168, 154, 0.15), transparent 40%)`,
            }}
        />
    );
};
