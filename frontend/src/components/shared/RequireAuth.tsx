import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';

interface RequireAuthProps {
  children: ReactNode;
}

// Wrap a page in this to make it signed-in only. Visitors are sent to /signin and returned here afterwards.
export function RequireAuth({ children }: RequireAuthProps) {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  if (user === null) {
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
}

export default RequireAuth;