import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { clearAuthError, registerAccount, signIn } from '../slices/authSlice';
import '../styles/AuthPage.css';

interface AuthPageProps {
  mode: 'signin' | 'register';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPage({ mode }: AuthPageProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, status, error } = useAppSelector((state) => state.auth);

  const routeState = location.state as { from?: string } | null;
  const from = routeState !== null && routeState.from !== undefined ? routeState.from : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState('');

  const isRegister = mode === 'register';
  const isBusy = status === 'loading';

  // Start each visit with a clean form and no old error
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, mode]);

  // Once signed in, go back to where the visitor came from
  useEffect(() => {
    if (user !== null) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const checkForm = (): string => {
    if (isRegister && name.trim() === '') return 'Enter your name.';
    if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.';
    if (password === '') return 'Enter your password.';
    if (isRegister) {
      if (password.length < 8) return 'Use a password of at least 8 characters.';
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return 'Include at least one letter and one number in your password.';
      }
      if (!consent) return 'Please accept the privacy terms to create an account.';
    }
    return '';
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const problem = checkForm();
    setFormError(problem);
    if (problem !== '') return;

    if (isRegister) {
      dispatch(
        registerAccount({
          name: name.trim(),
          email: email.trim(),
          password: password,
          phone: phone.trim(),
          consent: consent,
        }),
      );
    } else {
      dispatch(signIn({ email: email.trim(), password: password }));
    }
  };

  const shownError = formError !== '' ? formError : error;

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Link to="/" className="auth-aside-logo" aria-label="Back to home">
          <Logo colour="light" />
        </Link>
        <div className="auth-aside-copy">
          <p className="auth-aside-eyebrow">{isRegister ? 'Join us' : 'Welcome back'}</p>
          <h2 className="auth-aside-title">
            {isRegister ? 'Find somewhere worth staying.' : 'Your next stay is one sign-in away.'}
          </h2>
          <p className="auth-aside-text">
            Save your favourite stays, book in minutes and keep every trip in one place.
          </p>
        </div>
      </aside>

      <main className="auth-main">
        <Link to="/" className="auth-mobile-logo" aria-label="Back to home">
          <Logo colour="dark" />
        </Link>

        <div className="auth-card">
          <span className="auth-chip">Guest account</span>
          <h1 className="auth-title">{isRegister ? 'Create your account' : 'Sign in'}</h1>

          <form className="form-grid" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <label className="field">
                Full name
                <input
                  className="field-input"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}

            <label className="field">
              Email
              <input
                className="field-input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            {isRegister && (
              <label className="field">
                Phone (optional)
                <input
                  className="field-input"
                  type="tel"
                  autoComplete="tel"
                  maxLength={20}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
            )}

            <label className="field">
              Password
              <span className="auth-password">
                <input
                  className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder={isRegister ? 'At least 8 characters, with a number' : 'Your password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="auth-show"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>

            {isRegister && (
              <label className="auth-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>
                  I agree to the privacy terms and consent to my details being stored to manage my
                  bookings (POPIA).
                </span>
              </label>
            )}

            {shownError !== '' && shownError !== null && (
              <p className="field-error" role="alert">
                {shownError}
              </p>
            )}

            <button type="submit" className="auth-submit" disabled={isBusy}>
              {isBusy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account? ' : 'New here? '}
            <Link to={isRegister ? '/signin' : '/register'} state={{ from: from }}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;