import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { resolveMediaUrl } from '../utils/imageUtils';

const GalleryPlaceholder = ({ className = '' }) => (
  <div className={`product-detail-gallery__placeholder ${className}`} aria-hidden>
    <ImageIcon size={48} strokeWidth={1.25} />
  </div>
);

const GalleryImage = ({ src, className }) => {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(src);

  if (!resolved || failed) {
    return <GalleryPlaceholder className={className} />;
  }

  return (
    <img
      src={resolved}
      alt=""
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

/**
 * Galerie produit — image principale + miniatures avec placeholders propres.
 */
export const ProductDetailGallery = ({
  images = [],
  productName,
  selectedIndex = 0,
  onSelect,
  isOutOfStock = false,
}) => {
  const safeImages = Array.isArray(images) ? images : [];
  const current = safeImages[selectedIndex];

  return (
    <div className="product-detail-gallery">
      <div className="product-detail-gallery__main">
        <GalleryImage
          src={current?.image_url}
          className="product-detail-gallery__main-img"
        />
        {isOutOfStock && (
          <div className="product-detail-gallery__sold-out">
            <span>Rupture de stock</span>
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="product-detail-gallery__thumbs">
          {safeImages.map((img, idx) => (
            <button
              key={img.id ?? idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`product-detail-gallery__thumb-btn${
                idx === selectedIndex ? ' is-active' : ''
              }`}
              aria-label={`${productName} — image ${idx + 1}`}
            >
              <GalleryImage
                src={img.image_url}
                className="product-detail-gallery__thumb-img"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
