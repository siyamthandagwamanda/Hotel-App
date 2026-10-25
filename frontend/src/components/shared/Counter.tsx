//import styles from "./../styles/Counter.css"

interface CounterProps {
    label: string;
    hint?: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}

export function Counter({label, hint, value, min, max, onChange}: CounterProps){
    return(
        <div className="counter">
            <div className="counter-text">
                <span className="counter-label">{label}</span>
                {hint !== undefined && <span className="counter-hint">{hint}</span>}
            </div>

            <div className="counter-controls">
                <button
                    type="button"
                    className="counter-button"
                    aria-label={`less ${label.toLowerCase()}`}
                    disabled={value <= min}
                    onClick={() => onChange(value - 1)}
                >
                    &minus;
                </button>

                <span className="counter-value" aria-live="polite">
                    {value}
                </span>

                <button
                    type="button"
                    className="counter-button"
                    aria-label={`More ${label.toLowerCase()}`}
                    disabled={value >= max}
                    onClick={() => onChange(value + 1)}
                >
                    +
                </button>
            </div>
        </div>
    )
}

export default Counter; 