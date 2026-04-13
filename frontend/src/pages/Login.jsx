import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EmailIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ open, color }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function InputField({ id, label, type, value, onChange, icon, endAdornment, error }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative" style={{ marginBottom: '20px' }}>
      <label htmlFor={id} style={{
        position: 'absolute', left: '44px',
        top: focused || hasValue ? '6px' : '50%',
        transform: focused || hasValue ? 'translateY(0) scale(0.78)' : 'translateY(-50%) scale(1)',
        transformOrigin: 'left center',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        color: error ? '#c0392b' : focused ? '#69807E' : '#939790',
        fontSize: '14px', pointerEvents: 'none', zIndex: 1,
        letterSpacing: '0.05em', fontFamily: 'Raleway, sans-serif', fontWeight: '500',
      }}>
        {label}
      </label>

      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', transition: 'opacity 0.2s', opacity: focused ? 1 : 0.5 }}>
        {icon}
      </span>

      <input
        id={id} type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder="" autoComplete={id}
        style={{
          width: '100%', paddingLeft: '44px',
          paddingRight: endAdornment ? '44px' : '14px',
          paddingTop: '24px', paddingBottom: '10px',
          backgroundColor: focused ? '#D4E0E2' : '#F3F2F5',
          border: `1.5px solid ${error ? '#c0392b' : focused ? '#69807E' : '#939790'}`,
          borderRadius: '4px', fontSize: '15px', color: '#2C2C2C', outline: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'Raleway, sans-serif', letterSpacing: '0.02em',
          boxShadow: focused ? '0 0 0 3px rgba(105, 128, 126, 0.12)' : 'none',
        }}
      />

      {endAdornment && (
        <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
          {endAdornment}
        </span>
      )}

      {error && (
        <p style={{ marginTop: '4px', fontSize: '12px', color: '#c0392b', fontFamily: 'Raleway, sans-serif', letterSpacing: '0.03em' }}>
          {error}
        </p>
      )}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = from || (user.role === 'admin' ? '/admin/dashboard' : '/boutique/dashboard');
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const validate = () => {
    const errors = {};
    if (!email) errors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email invalide';
    if (!password) errors.password = 'Le mot de passe est requis';
    else if (password.length < 6) errors.password = 'Minimum 6 caractères';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setIsLoading(true);

    try {
      const userData = await login(email, password);
      const destination = userData.role === 'admin' ? '/admin/dashboard' : '/boutique/dashboard';
      navigate(destination, { replace: true });

    } catch (err) {
      // Priorité : message Laravel JSON → message HTTP → fallback UI
      const serverMessage = err?.response?.data?.message;
      const fallback = 'Email ou mot de passe incorrect. Veuillez réessayer.';
      setError(serverMessage || err?.message || fallback);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Raleway:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .fa-login-root { min-height: 100vh; display: flex; background-color: #F3F2F5; opacity: 0; transition: opacity 0.8s ease; }
        .fa-login-root.mounted { opacity: 1; }
        .fa-panel-left { display: none; position: relative; overflow: hidden; }
        @media (min-width: 1024px) { .fa-panel-left { display: flex; flex: 1; } }
        .fa-geo-overlay { position: absolute; inset: 0; z-index: 1; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px); }
        .fa-panel-right { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 48px 32px; width: 100%; }
        @media (min-width: 1024px) { .fa-panel-right { width: 480px; flex: none; padding: 64px 56px; } }
        .fa-btn-submit { width: 100%; padding: 16px; background-color: #69807E; color: #FFFFFF; border: none; border-radius: 4px; font-family: 'Raleway', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .fa-btn-submit:hover:not(:disabled) { background-color: #556968; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(105,128,126,0.3); }
        .fa-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .fa-error-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background-color: #fdf2f2; border: 1px solid #e8c5c5; border-left: 3px solid #c0392b; border-radius: 4px; margin-bottom: 20px; animation: fa-shake 0.4s ease; }
        @keyframes fa-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .fa-brand-letter { display: inline-block; animation: fa-float 3s ease-in-out infinite; }
        @keyframes fa-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .fa-form-field { opacity: 0; transform: translateY(16px); animation: fa-slide-up 0.5s ease forwards; }
        @keyframes fa-slide-up { to { opacity: 1; transform: translateY(0); } }
        .fa-form-field:nth-child(1){animation-delay:0.1s} .fa-form-field:nth-child(2){animation-delay:0.2s} .fa-form-field:nth-child(3){animation-delay:0.3s}
        .fa-stripe { position: absolute; bottom: 0; left: 0; right: 0; height: 180px; background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.06) 50%); z-index: 2; }
        .fa-link { color: #69807E; text-decoration: none; font-family: 'Raleway', sans-serif; font-size: 12px; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
        .fa-link:hover { border-color: #69807E; }
      `}</style>

      <div className={`fa-login-root${mounted ? ' mounted' : ''}`}>

        {/* PANNEAU GAUCHE */}
        <div className="fa-panel-left" style={{ background: 'linear-gradient(160deg,#2C3A39 0%,#3D5452 30%,#69807E 60%,#8FA5A3 80%,#E3C8B5 100%)', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 52px' }}>
          <div className="fa-geo-overlay" />
          <div className="fa-stripe" />
          <div style={{ position: 'relative', zIndex: 3 }}>
            <div style={{ width: '40px', height: '2px', backgroundColor: '#E3C8B5', marginBottom: '16px' }} />
            <p style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '13px', letterSpacing: '0.35em', color: 'rgba(227,200,181,0.7)', textTransform: 'uppercase', fontWeight: 300 }}>FashionAura</p>
          </div>
          <div style={{ position: 'relative', zIndex: 3 }}>
            <p style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '13px', letterSpacing: '0.3em', color: 'rgba(227,200,181,0.6)', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 300 }}>L'élégance comme philosophie</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(42px,5vw,68px)', fontWeight: 300, lineHeight: '1.1', color: '#F3F2F5' }}>
              <em style={{ color: '#E3C8B5', fontStyle: 'italic' }}>La mode commence </em>ici.
            </h2>
          </div>
          <div style={{ position: 'relative', zIndex: 3, display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['#E3C8B5','#D4E0E2','#939790'].map((c,i) => <div key={i} style={{ width: i===0?'32px':'8px', height: '2px', backgroundColor: c, opacity: 0.7 }} />)}
          </div>
        </div>

        {/* PANNEAU DROIT */}
        <div className="fa-panel-right">
          <div style={{ width: '100%', maxWidth: '380px' }}>

            <div className="fa-form-field" style={{ marginBottom: '48px' }}>
              <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(36px,5vw,48px)', fontWeight: 300, color: '#2C2C2C', letterSpacing: '-0.01em', marginBottom: '12px' }}>
                {'FashionAura'.split('').map((l,i) => (
                  <span key={i} className="fa-brand-letter" style={{ color: i<7?'#69807E':'#2C2C2C', animationDelay:`${i*0.12}s` }}>{l}</span>
                ))}
              </h1>
              <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: '13px', color: '#939790', letterSpacing: '0.08em' }}>Connectez-vous à votre espace</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Bannière erreur — key={error} force le re-mount pour rejouer l'animation shake */}
              {error && (
                <div className="fa-form-field fa-error-banner" key={error}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                  <p style={{ fontFamily: 'Raleway,sans-serif', fontSize: '13px', color: '#c0392b', margin: 0 }}>{error}</p>
                </div>
              )}

              <div className="fa-form-field">
                <InputField
                  id="email" label="Adresse email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(p=>({...p,email:''})); setError(''); }}
                  icon={<EmailIcon color={fieldErrors.email?'#c0392b':'#69807E'} />}
                  error={fieldErrors.email}
                />
              </div>

              <div className="fa-form-field">
                <InputField
                  id="password" label="Mot de passe" type={showPassword?'text':'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p=>({...p,password:''})); setError(''); }}
                  icon={<LockIcon color={fieldErrors.password?'#c0392b':'#69807E'} />}
                  endAdornment={
                    <button type="button" onClick={() => setShowPassword(p=>!p)} style={{ background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center' }}>
                      <EyeIcon open={!showPassword} color="#939790" />
                    </button>
                  }
                  error={fieldErrors.password}
                />
              </div>

              <div className="fa-form-field" style={{ textAlign:'right', marginBottom:'20px' }}>
                <Link to="/forgot-password" className="fa-link">Mot de passe oublié ?</Link>
              </div>

              <div className="fa-form-field">
                <button type="submit" className="fa-btn-submit" disabled={isLoading}>
                  {isLoading ? <><SpinnerIcon /><span>Connexion…</span></> : 'SE CONNECTER'}
                </button>
              </div>

              <div className="fa-form-field" style={{ marginTop:'24px', textAlign:'center', borderTop:'1px solid #E8E5E0', paddingTop:'24px' }}>
                <p style={{ color:'#939790', fontSize:'13px', fontFamily:'Raleway,sans-serif' }}>
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="fa-link" style={{ fontSize:'13px' }}>Créer un compte</Link>
                </p>
              </div>
            </form>

            <div style={{ marginTop:'48px', paddingTop:'24px', borderTop:'1px solid #E8E5E0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ fontFamily:'Raleway,sans-serif', fontSize:'11px', color:'#C0C0BC' }}>© 2026 FashionAura</p>
              <div style={{ display:'flex', gap:'8px' }}>
                {['#69807E','#939790','#E3C8B5'].map((c,i) => <div key={i} style={{ width:'6px',height:'6px',borderRadius:'50%',backgroundColor:c,opacity:0.6 }} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;