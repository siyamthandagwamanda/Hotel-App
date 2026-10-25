import { EntryPage } from './pages/EntryPage.js';
import { SearchResultsPage } from './pages/SearchResultsPage.js';
import { useAppSelector } from './hooks/storeHooks'

export function App() {
  // 1. Single State Lookup (Our Single Source of Truth)
  const { currentPage } = useAppSelector((state) => state.journey);

  // 2. Pure Functional Component Lookup Map (Saves memory, zero crashes)
  const ActivePage = currentPage === 1 ? SearchResultsPage : EntryPage;

  // 3. Flat Single Return Tag
  return <ActivePage />;
}

export default App;
