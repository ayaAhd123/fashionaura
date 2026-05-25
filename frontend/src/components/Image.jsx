/**
 * Composant pour afficher des images avec gestion complète
 * Inclut: lazy loading, error handling, placeholders, optimisation
 */

import React, { useState, useEffect } from 'react';
import { optimizeImageUrl, DEFAULT_IMAGES } from '../utils/imageUtils';

/**
 * Composant Image avec tous les features
 * @param {string} src - Source de l'image
 * @param {string} alt - Texte alternatif
 * @param {string} className - Classes CSS
 * @param {boolean} lazy - Lazy loading (défaut: true)
 * @param {string} fallback - Image de fallback
 * @param {function} onLoad - Callback au chargement
 * @param {function} onError - Callback en cas d'erreur
 */
const Image = ({
  src,
  alt = 'Image',
  className = '',
  lazy = true,
  fallback = DEFAULT_IMAGES.PRODUCT,
  onLoad,
  onError,
  width,
  height,
  objectFit = 'cover',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(lazy ? null : (src || fallback));
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!lazy) return;

    const img = new window.Image();
    img.src = optimizeImageUrl(src || fallback);
    
    img.onload = () => {
      setImageSrc(img.src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setImageSrc(fallback);
      setHasError(true);
      onError?.();
    };
  }, [src, lazy, fallback, onLoad, onError]);

  const handleImageError = () => {
    setImageSrc(fallback);
    setHasError(true);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <img
      src={lazy ? imageSrc : src || fallback}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{
        ...(width && { width }),
        ...(height && { height }),
        objectFit: objectFit,
      }}
      {...props}
    />
  );
};

/**
 * Composant Avatar avec initiales ou image
 * @param {string} src - Image source
 * @param {string} name - Nom pour initiales
 * @param {string} size - Taille: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Classes CSS
 */
export const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (text) => {
    if (!text) return '?';
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorFromName = (text) => {
    const colors = [
      'bg-primary text-white',
      'bg-secondary text-text',
      'bg-accent text-text',
      'bg-neutral text-white',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
  };

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold ${sizeClasses[size]} ${getColorFromName(name)} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

/**
 * Composant Placeholder pendant le chargement
 * @param {string} type - Type: 'product', 'boutique', 'avatar'
 * @param {string} className - Classes CSS
 */
export const ImagePlaceholder = ({ type = 'product', className = '' }) => {
  const types = {
    product: (
      <div className={`bg-light-ash animate-pulse flex items-center justify-center ${className}`}>
        <svg className="w-1/3 h-1/3 text-olive-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    ),
    boutique: (
      <div className={`bg-light-ash animate-pulse flex items-center justify-center ${className}`}>
        <svg className="w-1/3 h-1/3 text-olive-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
    ),
    avatar: (
      <div className={`bg-light-ash animate-pulse rounded-full ${className}`} />
    ),
  };

  return types[type] || types.product;
};

/**
 * Composant Galerie d'images
 * @param {array} images - Array d'URLs d'images
 * @param {number} selectedIndex - Index sélectionné
 * @param {function} onSelect - Callback lors de la sélection
 * @param {string} className - Classes CSS
 */
export const ImageGallery = ({
  images = [],
  selectedIndex = 0,
  onSelect,
  className = '',
}) => {
  const [selected, setSelected] = useState(selectedIndex);

  const handleSelect = (index) => {
    setSelected(index);
    onSelect?.(index);
  };

  if (!images.length) {
    return <ImagePlaceholder type="product" className={`w-full aspect-square ${className}`} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Image principale */}
      <div className="aspect-square rounded-lg overflow-hidden bg-light-ash">
        <Image
          src={images[selected]}
          alt="Product"
          className="w-full h-full"
          objectFit="cover"
        />
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                selected === index
                  ? 'border-sage-green'
                  : 'border-light-ash hover:border-dusty-blue'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index}`}
                className="w-full h-full"
                objectFit="cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Composant Chargement d'image progressif
 * Affiche d'abord une version floue, puis l'image complète
 */
export const ProgressiveImage = ({
  src,
  placeholderSrc,
  alt = 'Image',
  className = '',
  onLoad,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-light-ash ${className}`}>
      {/* Placeholder flou */}
      {placeholderSrc && !imageLoaded && (
        <Image
          src={placeholderSrc}
          alt={alt}
          className="w-full h-full blur-md"
          objectFit="cover"
        />
      )}

      {/* Image principale */}
      <Image
        src={src}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        objectFit="cover"
        onLoad={() => {
          setImageLoaded(true);
          onLoad?.();
        }}
      />
    </div>
  );
};

export default Image;
