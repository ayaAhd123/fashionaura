import { useState, useRef, useEffect } from 'react';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" style={{ animation: 'fa-sb-spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/**
 * SearchBar — barre de recherche réutilisable
 *
 * Props:
 *   placeholder   : string
 *   value         : string (controlled)
 *   onChange      : (value: string) => void
 *   onSearch      : (value: string) => void  — appelé sur Enter ou après debounce
 *   suggestions   : string[]                 — liste de suggestions à afficher
 *   onSuggestion  : (suggestion: string) => void
 *   debounce      : number (ms, défaut 300)
 *   loading       : boolean
 *   width         : string (défaut '100%')
 */
export default function SearchBar({
  placeholder = 'Rechercher…',
  value,
  onChange,
  onSearch,
  suggestions = [],
  onSuggestion,
  debounce: debounceMs = 300,
  loading = false,
  width = '100%',
}) {
  // Mode non-contrôlé si value n'est pas fourni
  const [internalValue, setInternalValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceTimer = useRef(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    if (!isControlled) setInternalValue(val);
    onChange?.(val);

    // Debounce onSearch
    if (onSearch && debounceMs > 0) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => onSearch(val), debounceMs);
    }

    setShowSuggestions(val.length > 0 && suggestions.length > 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer.current);
      onSearch?.(currentValue);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue('');
    onChange?.('');
    onSearch?.('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (s) => {
    if (!isControlled) setInternalValue(s);
    onChange?.(s);
    onSuggestion?.(s);
    onSearch?.(s);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(currentValue.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes fa-sb-spin { to { transform: rotate(360deg); } }
        @keyframes fa-sb-drop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .fa-sb-suggestion:hover { background-color: #F3F2F5 !important; }
      `}</style>

      <div ref={wrapperRef} style={{ position: 'relative', width }}>

        {/* ── Input wrapper ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          backgroundColor: focused ? '#fff' : '#F3F2F5',
          border: `1.5px solid ${focused ? '#69807E' : 'rgba(147,151,144,0.25)'}`,
          borderRadius: 12,
          height: 44,
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: focused ? '0 0 0 3px rgba(105,128,126,0.10)' : 'none',
        }}>

          {/* Icône gauche */}
          <span style={{
            color: focused ? '#69807E' : '#939790',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            {loading ? <SpinnerIcon /> : <SearchIcon />}
          </span>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setFocused(true);
              if (currentValue && filteredSuggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'Raleway, sans-serif',
              fontSize: 14,
              color: '#2C2C2C',
              letterSpacing: '0.02em',
            }}
          />

          {/* Bouton clear */}
          {currentValue && (
            <button
              onClick={handleClear}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: '50%',
                border: 'none', cursor: 'pointer', flexShrink: 0,
                backgroundColor: 'rgba(147,151,144,0.2)',
                color: '#939790',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#D4E0E2'; e.currentTarget.style.color = '#69807E'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(147,151,144,0.2)'; e.currentTarget.style.color = '#939790'; }}
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* ── Dropdown suggestions ── */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
            backgroundColor: '#fff',
            border: '1px solid rgba(147,151,144,0.18)',
            borderRadius: 12,
            boxShadow: '0 8px 28px rgba(44,58,57,0.12)',
            overflow: 'hidden',
            animation: 'fa-sb-drop 0.18s ease forwards',
          }}>
            {filteredSuggestions.map((s, i) => (
              <div
                key={i}
                className="fa-sb-suggestion"
                onMouseDown={() => handleSuggestionClick(s)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderBottom: i < filteredSuggestions.length - 1 ? '1px solid #F3F2F5' : 'none',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ color: '#D4E0E2', display: 'flex', alignItems: 'center' }}>
                  <SearchIcon />
                </span>
                <span style={{
                  fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#2C2C2C',
                }}>
                  {/* Highlight la partie matchée */}
                  {highlightMatch(s, currentValue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Utilitaire : surligne la portion matchée ─────────────────────────────────
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{ color: '#69807E', fontWeight: 600 }}>
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  );
}