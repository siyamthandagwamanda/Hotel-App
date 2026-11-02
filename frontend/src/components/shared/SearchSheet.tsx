import { useState } from 'react';
import type { FormEvent } from 'react';
import BottomSheet from '../../components/shared/BottomSheet.js';
import Counter from '../../components/shared/Counter.js';
import { useAppDispatch, useAppSelector } from './../../hooks/storeHooks';
import { setCity, setDates, setGuests } from './../../slices/searchSlice';

interface SearchSheetProps {
  onClose: () => void;
  onSubmit: () => void;
}

export function SearchSheet({ onClose, onSubmit }: SearchSheetProps) {
  const dispatch = useAppDispatch();
  
  
  const search = useAppSelector((state) => state.search);

  const [city, setCityText] = useState(search.city);
  const [checkIn, setCheckIn] = useState(search.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(search.checkOut ?? '');
  const [adults, setAdults] = useState(search.guests.adults);
  const [children, setChildren] = useState(search.guests.children);
  const [rooms, setRooms] = useState(search.guests.rooms);
  const [error, setError] = useState('');


  const today = new Intl.DateTimeFormat('en-CA').format(new Date());


  const getDayAfter = (dateText: string): string => {
    if (!dateText) return today;
    const [year, month, day] = dateText.split('-').map(Number);
    const next = new Date(year, month - 1, day + 1);
    return new Intl.DateTimeFormat('en-CA').format(next);
  };

  const checkOutMin = checkIn === '' ? getDayAfter(today) : getDayAfter(checkIn);

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    if (value !== '' && checkOut !== '' && checkOut <= value) {
      setCheckOut('');
    }
  };

  const handleAdultsChange = (value: number) => {
    setAdults(value);
    if (rooms > value) {
      setRooms(value);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if ((checkIn === '') !== (checkOut === '')) {
      setError('Choose both check-in and check-out, or leave both empty.');
      return;
    }
    if (checkIn !== '' && checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }
    setError('');

    
    dispatch(setCity(city.trim()));
    dispatch(
      setDates({
        checkIn: checkIn === '' ? null : checkIn,
        checkOut: checkOut === '' ? null : checkOut,
      })
    );
    dispatch(setGuests({ adults: adults, children: children, rooms: rooms }));
    onSubmit();
  };

  return (
    <BottomSheet title="Search stays" onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          Where to?
          <input
            className="field-input"
            type="text"
            value={city}
            placeholder="City, province or hotel"
            maxLength={80}
            onChange={(event) => setCityText(event.target.value)}
          />
        </label>

        <div className="field-row">
          <label className="field">
            Check-in
            <input
              className="field-input"
              type="date"
              value={checkIn}
              min={today}
              onChange={(event) => handleCheckInChange(event.target.value)}
            />
          </label>
          <label className="field">
            Check-out
            <input
              className="field-input"
              type="date"
              value={checkOut}
              min={checkOutMin}
              onChange={(event) => setCheckOut(event.target.value)}
            />
          </label>
        </div>

        
        <Counter label="Adults" hint="Age 13 and over" value={adults} min={1} max={12} onChange={handleAdultsChange} />
        <Counter label="Children" hint="Age 0 to 12" value={children} min={0} max={8} onChange={setChildren} />
        <Counter label="Rooms" value={rooms} min={1} max={Math.min(5, adults)} onChange={setRooms} />

        {error !== '' && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

       
        <button type="submit" className="form-submit-button">
          Show stays
        </button>
      </form>
    </BottomSheet>
  );
}

export default SearchSheet;
