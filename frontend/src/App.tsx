import { Routes, Route, Navigate } from 'react-router-dom';
import { EntryPage } from './pages/EntryPage.js';
//import { SearchResultsPage } from './pages/SearchResultsPage.js';

export function App() {
  return (
    <Routes>
    
      <Route path="/" element={<EntryPage />} />
      
    
      {/* <Route path="/search" element={<SearchResultsPage />} /> */}
      
     
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
