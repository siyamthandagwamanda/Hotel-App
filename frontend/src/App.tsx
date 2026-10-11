import { useAppSelector } from "./hooks/storeHooks"

function App() {

  const {city, guests} = useAppSelector((state) => state.search);

  return (
    <main>
      <h1>NextStay</h1>
      <p>City: {city === '' ? 'not chosen' : city}</p>
      <p>Adults: {guests.adults}</p>
    </main>
  );
}

export default App;
