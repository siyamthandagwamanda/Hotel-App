import { Navigate, Route, Routes } from "react-router-dom";
import { EntryPage } from './pages/EntryPage';
import { HotelDetailPage } from './pages/HotelDetailPage'
import { AuthPage } from './pages/AuthPage'
import { BookingPage } from './pages/BookingPage'
import { TripsPage } from './pages/TripsPage'
import { AdminPage } from './pages/AdminPage'
import { RequireAuth } from './components/shared/RequireAuth'

export function App(){
  return(
    <Routes>
      <Route path="/" element={ <EntryPage /> }/>
      <Route path="/search" element={ <Navigate to="/" replace /> }/>
      <Route path="/hotels/:id" element={ <HotelDetailPage/> } />
      <Route path="/signin" element={ <AuthPage key="signin" mode="signin" /> } />
      <Route path="/register" element={ <AuthPage key="register" mode="register" /> } />
      <Route path="/admin" element={ <RequireAuth role="admin"><AdminPage /></RequireAuth> } />
      <Route path="/trips" element={ <RequireAuth><TripsPage /></RequireAuth> } />
      <Route path="/bookings/:reference" element={ <RequireAuth><BookingPage /></RequireAuth> } />
    </Routes>
  )
}

export default App;