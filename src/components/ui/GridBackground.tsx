import { useEffect, useRef, useCallback } from 'react';

const CELL_SIZE = 40;
const GLOW_RADIUS_X = 250;
const GLOW_RADIUS_Y = 200;
const EASING = 0.035; // Slower follow for more noticeable delay
const FADE_IN_SPEED = 0.015; // How fast the glow fades in when cursor first enters

// Base grid colors
const BASE_STROKE = 'rgba(255, 255, 255, 0.04)';
const BASE_LINE_WIDTH = 0.5;

// Glow grid colors
const GLOW_LINE_WIDTH = 1;

export const GridBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const trackedRef = useRef({ x: -9999, y: -9999 });
    const rafRef = useRef<number>(0);
    const scrollRef = useRef({ x: 0, y: 0 });
    const glowOpacityRef = useRef(0); // For fade-in effect
    const hasEnteredRef = useRef(false); // Track if cursor has entered viewport

    const drawGrid = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            w: number,
            h: number,
            strokeStyle: string,
            lineWidth: number,
            offsetX: number,
            offsetY: number
        ) => {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();

            // Vertical lines
            const startCol = Math.floor(offsetX / CELL_SIZE);
            const endCol = Math.ceil((offsetX + w) / CELL_SIZE);
            for (let col = startCol; col <= endCol; col++) {
                const x = col * CELL_SIZE - offsetX;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
            }

            // Horizontal lines
            const startRow = Math.floor(offsetY / CELL_SIZE);
            const endRow = Math.ceil((offsetY + h) / CELL_SIZE);
            for (let row = startRow; row <= endRow; row++) {
                const y = row * CELL_SIZE - offsetY;
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
            }

            ctx.stroke();
        },
        []
    );

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        // Resize canvas if needed
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
        }

        // Lerp tracked position toward mouse (slow follow)
        const tracked = trackedRef.current;
        const mouse = mouseRef.current;
        tracked.x += (mouse.x - tracked.x) * EASING;
        tracked.y += (mouse.y - tracked.y) * EASING;

        // Fade in/out the glow opacity
        const cursorInViewport = mouse.x > -1000 && mouse.y > -1000;
        if (cursorInViewport) {
            if (!hasEnteredRef.current) {
                // First time cursor enters — snap tracked position to mouse to avoid flying in from corner
                tracked.x = mouse.x;
                tracked.y = mouse.y;
                hasEnteredRef.current = true;
            }
            glowOpacityRef.current = Math.min(1, glowOpacityRef.current + FADE_IN_SPEED);
        } else {
            glowOpacityRef.current = Math.max(0, glowOpacityRef.current - FADE_IN_SPEED * 2);
            hasEnteredRef.current = false;
        }

        const opacity = glowOpacityRef.current;
        const scrollX = scrollRef.current.x;
        const scrollY = scrollRef.current.y;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // 1. Draw base grid (full viewport)
        drawGrid(ctx, w, h, BASE_STROKE, BASE_LINE_WIDTH, scrollX % CELL_SIZE, scrollY % CELL_SIZE);

        // 2. Draw glow effect at tracked position (only if visible)
        if (opacity > 0.01) {
            const glowX = tracked.x;
            const glowY = tracked.y - scrollRef.current.y;

            // Only draw if reasonably near viewport
            if (glowX > -GLOW_RADIUS_X * 2 && glowX < w + GLOW_RADIUS_X * 2 &&
                glowY > -GLOW_RADIUS_Y * 2 && glowY < h + GLOW_RADIUS_Y * 2) {

                ctx.save();
                ctx.globalAlpha = opacity;

                // --- Soft glow background (radial gradient, NO hard clip) ---
                const bgGradient = ctx.createRadialGradient(
                    glowX, glowY, 0,
                    glowX, glowY, Math.max(GLOW_RADIUS_X, GLOW_RADIUS_Y)
                );
                bgGradient.addColorStop(0, 'rgba(0, 168, 154, 0.14)');
                bgGradient.addColorStop(0.3, 'rgba(0, 168, 154, 0.08)');
                bgGradient.addColorStop(0.6, 'rgba(0, 168, 154, 0.03)');
                bgGradient.addColorStop(1, 'rgba(0, 168, 154, 0)');
                ctx.fillStyle = bgGradient;
                ctx.fillRect(
                    glowX - GLOW_RADIUS_X * 1.5,
                    glowY - GLOW_RADIUS_Y * 1.5,
                    GLOW_RADIUS_X * 3,
                    GLOW_RADIUS_Y * 3
                );

                // --- Bright grid lines with soft radial fade (no hard elliptical clip) ---
                // We draw the bright grid on a temporary canvas, then composite it with a radial alpha mask
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');

                if (tempCtx) {
                    tempCtx.scale(dpr, dpr);

                    // Draw bright grid lines on temp canvas
                    drawGrid(
                        tempCtx, w, h,
                        `rgba(0, 168, 154, ${0.4 * opacity})`,
                        GLOW_LINE_WIDTH,
                        scrollX % CELL_SIZE,
                        scrollY % CELL_SIZE
                    );

                    // Apply soft radial mask using destination-in compositing
                    tempCtx.globalCompositeOperation = 'destination-in';
                    const maskGradient = tempCtx.createRadialGradient(
                        glowX, glowY, 0,
                        glowX, glowY, Math.max(GLOW_RADIUS_X, GLOW_RADIUS_Y)
                    );
                    maskGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                    maskGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.7)');
                    maskGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
                    maskGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    tempCtx.fillStyle = maskGradient;
                    tempCtx.fillRect(0, 0, w, h);

                    // Draw the masked bright grid onto main canvas
                    ctx.drawImage(tempCanvas, 0, 0, w, h);
                }

                ctx.restore();
            }
        }

        rafRef.current = requestAnimationFrame(animate);
    }, [drawGrid]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleScroll = () => {
            scrollRef.current = { x: window.scrollX, y: window.scrollY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };

        window.addEventListener('pointermove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);

        // Start animation loop
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('pointermove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(rafRef.current);
        };
    }, [animate]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                width: '100vw',
                height: '100vh',
            }}
        />
    );
};
