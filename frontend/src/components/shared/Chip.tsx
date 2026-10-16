import './Chip.css';

interface ChipProps{
    label: string;
    selected?: boolean;
    onClick: () => void;
}

export function Chip({label, selected = false, onClick}: ChipProps){
    return(
        <button
            type='button'
            className={selected ? 'chip chip-selected' : 'chip'}
            aria-pressed={selected}
            onClick={onClick}
        >
            {label}
        </button>
    )
}

export default Chip;