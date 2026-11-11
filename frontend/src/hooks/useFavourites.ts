import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './storeHooks';
import { saveFavourite } from '../slices/favouriteSlice';

// Gives a component the saved hotels and a heart handler.
// Saving needs an account, so signed-out visitors are sent to sign in first.
export function useFavourites() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const savedIds = useAppSelector((state) => state.favourites.hotelIds);

  function toggle(hotelId: number): void {
    if (user === null) {
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }
    dispatch(saveFavourite({ hotelId: hotelId, save: !savedIds.includes(hotelId) }));
  }

  return { savedIds, toggle };
}