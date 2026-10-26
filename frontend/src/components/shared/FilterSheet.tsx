import { useState } from 'react';
import BottomSheet from '../../components/shared/BottomSheet';
import Chip from '../../components/shared/Chip';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { clearFilters, setFilters } from './../../slices/searchSlice';
import './FilterSheet.css';

interface FilterSheetProps {
  onClose: () => void;
}

interface StarOption {
  label: string;
  value: number | null;
}

interface TypeOption {
  label: string;
  value: string | null;
}

const starOptions: StarOption[] = [
  { label: 'Any', value: null },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
];

const typeOptions: TypeOption[] = [
  { label: 'Any', value: null },
  { label: 'Beach', value: 'beach' },
  { label: 'City', value: 'city' },
  { label: 'Safari', value: 'safari' },
  { label: 'Mountain', value: 'mountain' },
  { label: 'Countryside', value: 'countryside' },
];

export function FilterSheet({ onClose }: FilterSheetProps) {
  const dispatch = useAppDispatch();

 
  const filters = useAppSelector((state) => state.search.filters);
  const { amenities } = useAppSelector((state) => state.hotels);

  const [minPrice, setMinPrice] = useState(filters.minPrice === null ? '' : String(filters.minPrice));
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice === null ? '' : String(filters.maxPrice));
  const [stars, setStars] = useState<number | null>(filters.stars);
  const [propertyType, setPropertyType] = useState<string | null>(filters.propertyType);
  const [amenityIds, setAmenityIds] = useState<number[]>(filters.amenityIds);
  const [error, setError] = useState('');

  const toggleAmenity = (id: number) => {

    if (amenityIds.includes(id)) {
      setAmenityIds(amenityIds.filter((existing) => existing !== id));
    } else {
      setAmenityIds([...amenityIds, id]);
    }
  };

  const readPrice = (text: string): number | null | 'bad' => {
    
    if (text.trim() === '') {
      return null;
    }
    const number = Number(text);
    if (!Number.isInteger(number) || number < 0) {
      return 'bad';
    }
    return number;
  };

  const handleApply = () => {
    const min = readPrice(minPrice);
    const max = readPrice(maxPrice);

    if (min === 'bad' || max === 'bad') {
      setError('Prices must be whole numbers, zero or more.');
      return;
    }
    if (min !== null && max !== null && min > max) {
      setError('The lowest price cannot be more than the highest price.');
      return;
    }
    setError('');

    dispatch(
      setFilters({
        minPrice: min,
        maxPrice: max,
        stars: stars,
        amenityIds: amenityIds,
        propertyType: propertyType,
      }),
    );
    onClose();
  };

  const handleClear = () => {
    dispatch(clearFilters());
    onClose();
  };

  return (
    <BottomSheet
      title="Filters"
      onClose={onClose}
      footer={
        <div className="sheet-footer-buttons" style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button type="button" className="sheet-btn-secondary" onClick={handleClear}>
            Clear all
          </button>
          <button type="button" className="sheet-btn-primary" onClick={handleApply}>
            Show results
          </button>
        </div>
      }
    >
      <div className="form-grid">
        {/* Price Filtering Constraints input fields */}
        <div>
          <p className="field-group-title">Price per night (R)</p>
          <div className="field-row">
            <label className="field">
              Lowest
              <input
                className="field-input"
                type="number"
                inputMode="numeric"
                min={0}
                value={minPrice}
                placeholder="0"
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </label>
            <label className="field">
              Highest
              <input
                className="field-input"
                type="number"
                inputMode="numeric"
                min={0}
                value={maxPrice}
                placeholder="Any"
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </label>
          </div>
        </div>

        {/*Star Rating Selection row */}
        <div>
          <p className="field-group-title">Star rating</p>
          <div className="chip-row">
            {starOptions.map((option) => (
              <Chip
                key={option.label}
                label={option.label}
                selected={stars === option.value}
                onClick={() => setStars(option.value)}
              />
            ))}
          </div>
        </div>

        {/*Property Environment Category row */}
        <div>
          <p className="field-group-title">Property type</p>
          <div className="chip-row">
            {typeOptions.map((option) => (
              <Chip
                key={option.label}
                label={option.label}
                selected={propertyType === option.value}
                onClick={() => setPropertyType(option.value)}
              />
            ))}
          </div>
        </div>

        {/*Amenities Checkbox grid */}
        <div>
          <p className="field-group-title">Facilities</p>
          <div className="filter-amenities">
            {amenities &&
              amenities.map((amenity) => (
                <label className="filter-check" key={amenity.id}>
                  <input
                    type="checkbox"
                    checked={amenityIds.includes(amenity.id)}
                    onChange={() => toggleAmenity(amenity.id)}
                  />
                  {amenity.name}
                </label>
              ))}
          </div>
        </div>

        {error !== '' && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}

export default FilterSheet;
