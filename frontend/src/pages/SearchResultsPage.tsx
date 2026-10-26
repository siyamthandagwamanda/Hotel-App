import { useState } from 'react';
import type { ChangeEvent } from 'react';
import Logo from '../components/shared/Logo.js';
import ResultsList from './../components/shared/ResultsList';
import type { ResultsArgs } from './../components/shared/ResultsList';
import SearchSheet from './../components/shared/SearchSheet';
import FilterSheet from './../components/shared/FilterSheet';
import { setSort } from './../slices/searchSlice';
import { describeSearch } from './../utils/describeSearch';
import { countActiveFilters } from './../utils/countFilter';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { setCurrentPage } from '../slices/journeySlice.js';
//import './SearchResultsPage.css';

export type SortOrder = 'recommended' | 'price_asc' | 'price_desc' | 'rating';

interface SortOption {
  value: SortOrder;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Star rating' },
];

type OpenSheet = 'none' | 'search' | 'filters';

export function SearchResultsPage() {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.search);

  const [sheet, setSheet] = useState<OpenSheet>('none');
  const [openedId, setOpenedId] = useState<number | null>(null);

 
  const args: ResultsArgs = {
    city: search.city,
    checkIn: search.checkIn,
    checkOut: search.checkOut,
    adults: search.guests.adults,
    children: search.guests.children,
    rooms: search.guests.rooms,
    minPrice: search.filters.minPrice,
    maxPrice: search.filters.maxPrice,
    stars: search.filters.stars,
    amenityIds: search.filters.amenityIds,
    propertyType: search.filters.propertyType,
    sort: search.sort,
  };
  
  const argsKey = JSON.stringify(args);
  const filterCount = countActiveFilters(search.filters);

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const found = sortOptions.find((option) => option.value === event.target.value);
    if (found !== undefined) {
      dispatch(setSort(found.value));
    }
  };

  return (
    <div className="results-page">
      
      <header className="results-header">
        <button
          type="button"
          className="results-home"
          aria-label="Back to home"
          onClick={() => dispatch(setCurrentPage(0))}
        >
          <Logo colour="dark" />
        </button>
        
        {/* Interactive Search Summary Pill: Tapping slides open the edit sheet drawer */}
        <button
          type="button"
          className="results-pill"
          onClick={() => setSheet('search')}
        >
          {describeSearch(
            search.city,
            search.checkIn,
            search.checkOut,
            search.guests.adults,
          )}
        </button>
      </header>

      {/* filter drawers and sorting selector fields */}
      <div className="results-toolbar">
        <button
          type="button"
          className="results-filter-button"
          onClick={() => setSheet('filters')}
        >
          Filters
          {filterCount > 0 && <span className="results-badge">{filterCount}</span>}
        </button>

        <label className="results-sort">
          <span className="results-sort-label">Sort by</span>
          <select
            className="field-input"
            value={search.sort}
            onChange={handleSortChange}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {openedId !== null && (
        <p className="results-note">
          Hotel {openedId} selected. The detail page comes in a later step.
        </p>
      )}

      {/*Keyset Pagination*/}
      <ResultsList key={argsKey} args={args} onOpenHotel={setOpenedId} />

      {/*Overlay Drawer*/}
      {sheet === 'search' && (
        <SearchSheet
          onClose={() => setSheet('none')}
          onSubmit={() => setSheet('none')}
        />
      )}
      
      {sheet === 'filters' && (
        <FilterSheet
          onClose={() => setSheet('none')}
        />
      )}
    </div>
  );
}

export default SearchResultsPage;
