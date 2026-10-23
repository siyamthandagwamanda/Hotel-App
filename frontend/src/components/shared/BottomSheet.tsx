import {useEffect, useRef } from "react";
import type { ReactNode } from "react";
//import styles from './../styles/BottomSheet.css';

interface BottomSheetProps{
    title: string;
    onClose: () => void;
    footer?: ReactNode;
    children: ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

export function BottomSheet({title, onClose, footer, children}: BottomSheetProps){

    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef(onClose);

    useEffect(() => {

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const panel = panelRef.current;

        if (panel !== null){
            panel.focus();
        }

        const originalOverFlow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {

            if (event.key === 'Escape'){
                closeRef.current();
                return;
            }

            if (event.key !== 'Tab' || panel === null){
                return;
            }

            const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE)

            if (focusable.length === 0){
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === panel)){
                event.preventDefault();
                last.focus();
            }else if(
                !event.shiftKey && active === last
            ){
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverFlow;

            if (previouslyFocused !== null){
                previouslyFocused.focus();
            }
        };
    }, []);

    return(
        <div className="sheet-backdrop" onClick={onClose}>
            <div
                className="sheet-panel"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                ref={panelRef}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="sheet-header">
                    <h2 className="sheet-title">{title}</h2>
                    <button
                        type="button"
                        className="sheet-close"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                <div className="sheet-body">{children}</div>
                {footer !== undefined && <div className="sheet-footer">{footer}</div>}
            </div>
        </div>
    );
}

export default BottomSheet;