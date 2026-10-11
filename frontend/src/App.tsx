import { useAppSelector } from './hooks/storeHooks';

function App() {
  
  const { city, visitors } = useAppSelector((state) => state.search);

  return (
    <main>
      <h1>StayHop</h1>
      <p>City: {city === '' ? 'not chosen' : city}</p>
      <p>Adults: {visitors.adults}</p>
    </main>
  );
}

export default App;
