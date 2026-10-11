import { useGetShelvesQuery } from './hotel/hotelApi';

function App() {
  const { data, isLoading, isError } = useGetShelvesQuery('Pietermaritzburg');

  if (isLoading) {
    return <p>Loading shelves...</p>;
  }

  if (isError || !data) {
    return <p>Could not load shelves.</p>;
  }

  return (
    <main>
      <h1>StayHop</h1>
      {data.shelves.map((shelf) => (
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
