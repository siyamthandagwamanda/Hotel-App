import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks/storeHooks';
import { fetchShelvesByCity } from './slices/hotelSlices';

function App() {
 
  
  const dispatch = useAppDispatch();
  const { shelves, isLoading, error } = useAppSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(fetchShelvesByCity('Pietermaritzburg'));
  }, [dispatch]);

  if (isLoading) return <p>Loading stays...</p>;
  if (error) return <p>Could not load stays: {error}</p>;

  return (
    <main>
      <h1>NextStay</h1>
      {shelves.length === 0 && <p>No stays found.</p>}
      {shelves.map((shelf) => (
        <section key={shelf.id}>
          <h2>{shelf.title}</h2>
          <ul>
            {shelf.hotels.map((hotel) => (
              <li key={hotel.id}>
                {hotel.name} - {hotel.city} - R{hotel.fromPriceCents / 100}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

export default App;