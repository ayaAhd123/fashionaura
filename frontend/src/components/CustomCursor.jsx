import React, { useEffect, useRef } from 'react';
import '../styles/cursor.css';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const posRef = useRef({ x: -100, y: -100 });
    const rafRef = useRef(null);

    useEffect(() => {
        const onMove = (e) => {
            posRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', onMove);

        const loop = () => {
            if (cursorRef.current) {
                cursorRef.current.style.transform =
                    `translate(${posRef.current.x - 10}px, ${posRef.current.y - 10}px)`;
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        const addGrow = (e) => {
            if (e.target.closest('a, button, [data-cursor-grow], .map-dot-hitbox, .filter-pill, .boutique-card-link, .other-card, .fixed-map-link')) {
                cursorRef.current?.classList.add('cursor--grow');
            }
        };
        const rmGrow = (e) => {
            if (e.target.closest('a, button, [data-cursor-grow], .map-dot-hitbox, .filter-pill, .boutique-card-link, .other-card, .fixed-map-link')) {
                cursorRef.current?.classList.remove('cursor--grow');
            }
        };
        
        window.addEventListener('mouseover', addGrow);
        window.addEventListener('mouseout', rmGrow);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseover', addGrow);
            window.removeEventListener('mouseout', rmGrow);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return <div className="custom-cursor" ref={cursorRef} aria-hidden="true" />;
};

export default CustomCursor;
