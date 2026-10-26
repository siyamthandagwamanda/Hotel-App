import Logo from '../components/shared/Logo.js';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="landing-page">
      <header className="landing-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
        <Logo colour="dark" />
        
        {/*Forward Arrow Button Trigger to Swap to the Catalog Page */}
        <button 
          type="button" 
          className="pane-swap-arrow-btn"
          aria-label="View hotel catalog deck"
          onClick={onEnter}
          style={{
            background: 'var(--color-primary, #000)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          →
        </button>
      </header>

      <main className="landing-content" style={{ padding: '0 16px' }}>
       
        <h2>Find your perfect stay</h2>
        <p style={{ color: 'var(--color-muted, #666)' }}>Enter a South African city above or click the arrow to browse collections.</p>
      </main>
    </div>
  );
}

export default LandingPage;
