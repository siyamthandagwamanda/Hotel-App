import Chip from '../../components/shared/Chip';
import type { DeckChip } from './../../utils/homePageUtils';
import './../../styles/Chip.module.css';

interface ChipBarProps {
  chips: DeckChip[];
  activeChipId: string;
  onSelect: (chipId: string) => void;
}

export function ChipBar({ chips, activeChipId, onSelect }: ChipBarProps) {
  return (
    <div className="chip-bar">

      {chips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          selected={chip.id === activeChipId}
          onClick={() => onSelect(chip.id)}
        />
      ))}
    </div>
  );
}

export default ChipBar;
