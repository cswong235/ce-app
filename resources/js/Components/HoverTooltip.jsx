import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function HoverTooltip({ content, children, className = '' }) {
    const triggerRef = useRef(null);
    const [position, setPosition] = useState(null);

    const showTooltip = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPosition({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    };

    const hideTooltip = () => setPosition(null);

    return (
        <span
            ref={triggerRef}
            className={`inline-flex ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}
            {position && createPortal(
                <div
                    className="pointer-events-none fixed z-50 w-64 -translate-x-1/2 rounded-md bg-gray-900 p-2 text-xs text-white shadow-lg"
                    style={{ top: position.top, left: position.left }}
                >
                    {content}
                </div>,
                document.body
            )}
        </span>
    );
}
