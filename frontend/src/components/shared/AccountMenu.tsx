import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { signOut } from '../../slices/authSlice';
import '../../styles/AccountMenu.css';

// Signed out: a Sign in button. Signed in: the user's initial, with a small menu.
export function AccountMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (wrapperRef.current !== null && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (user === null) {
    return (
      <button
        type="button"
        className="account-signin"
        onClick={() => navigate('/signin', { state: { from: location.pathname } })}
      >
        Sign in
      </button>
    );
  }

  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <div className="account" ref={wrapperRef}>
      <button
        type="button"
        className="account-avatar"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {initial}
      </button>

      {open && (
        <div className="account-menu" role="menu">
          <div className="account-who">
            <strong className="account-name">{user.name}</strong>
            <span className="account-email">{user.email}</span>
          </div>
          <button
            type="button"
            role="menuitem"
            className="account-item"
            onClick={() => {
              setOpen(false);
              navigate('/trips');
            }}
          >
            My trips
          </button>
          {user.role === 'admin' && (
            <button
              type="button"
              role="menuitem"
              className="account-item"
              onClick={() => {
                setOpen(false);
                navigate('/admin');
              }}
            >
              Admin panel
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="account-item"
            onClick={() => {
              setOpen(false);
              dispatch(signOut());
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;