import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';

export default function ImageCropModal({
  open,
  imageSrc,
  preset,
  onConfirm,
  onCancel,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels || !preset) return;
    setProcessing(true);
    try {
      const result = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        `${preset.label.toLowerCase()}.jpg`,
        preset.outputWidth,
        preset.outputHeight,
      );
      if (result) onConfirm(result);
    } finally {
      setProcessing(false);
    }
  };

  if (!open || !imageSrc || !preset) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Recadrer ${preset.label}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          backgroundColor: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            fontWeight: 600,
            color: '#111827',
          }}
          >
            Recadrer {preset.label}
          </h3>
          <p style={{
            margin: '4px 0 0',
            fontFamily: 'Inter, sans-serif',
            fontSize: 12.5,
            color: '#6B7280',
          }}
          >
            Ajustez le cadrage et le zoom avant validation
          </p>
        </div>

        <div style={{ position: 'relative', width: '100%', height: 320, backgroundColor: '#111827' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={preset.aspect}
            cropShape={preset.cropShape}
            showGrid={preset.cropShape === 'rect'}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #F3F4F6' }}>
          <label style={{
            display: 'block',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11.5,
            fontWeight: 600,
            color: '#374151',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
          >
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#1B3A35' }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          padding: '16px 20px',
          borderTop: '1px solid #F3F4F6',
        }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: '1.5px solid #E5E7EB',
              backgroundColor: '#fff',
              color: '#374151',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: processing ? 'not-allowed' : 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !croppedAreaPixels}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#1B3A35',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: processing ? 'wait' : 'pointer',
              opacity: processing || !croppedAreaPixels ? 0.7 : 1,
            }}
          >
            {processing ? 'Traitement…' : 'Valider le cadrage'}
          </button>
        </div>
      </div>
    </div>
  );
}
