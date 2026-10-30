import { Route, Routes } from "react-router-dom";
import { EntryPage } from './pages/EntryPage';
import { SearchResultsPage } from './pages/SearchResultsPage'
import { HotelDetailPage } from './pages/HotelDetailPage'

export function App(){
  return(
    <Routes>
      <Route path="/" element={ <EntryPage /> }/>
      <Route path="/search" element={ <SearchResultsPage /> }/>
      <Route path="/hotels/:id" element={ <HotelDetailPage/> } />
    </Routes>
  )
}

export default App;