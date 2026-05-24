export default function LoadingSpinner({ size = 40, message = 'Chargement…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
      <div style={{
        width: size, height: size,
        border: `2px solid #D4E0E2`,
        borderTopColor: '#69807E',
        borderRadius: '50%',
        animation: 'fa-spin 0.8s linear infinite',
      }} />
      {message && (
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', letterSpacing: '0.08em' }}>
          {message}
        </p>
      )}
      <style>{`@keyframes fa-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}