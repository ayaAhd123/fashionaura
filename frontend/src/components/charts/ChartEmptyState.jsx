export default function ChartEmptyState({ message = 'Aucune donnée sur cette période.' }) {
  return (
    <div style={{
      height: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFCFD',
      borderRadius: 12,
      border: '1px dashed #D4E0E2',
    }}>
      <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#939790', textAlign: 'center', padding: 16 }}>
        {message}
      </p>
    </div>
  );
}
