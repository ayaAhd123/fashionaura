# 📸 Guide Images & Design FashionAura

## 🎨 Nouvelle Palette de Couleurs

```css
--primary: #6E7F78;       /* Sage Green - Vert Sauge */
--secondary: #D2B8A3;     /* Sand Beige - Beige Sable */
--accent: #B7C6C9;        /* Dusty Blue - Bleu Poudré */
--neutral: #8A908C;       /* Olive Gray - Gris Olive */
--background: #D9DDDF;    /* Light Ash - Cendre Clair */
```

### Couleurs CSS Tailwind Disponibles
```
sage-green      #6E7F78
sand-beige      #D2B8A3
dusty-blue      #B7C6C9
olive-gray      #8A908C
light-ash       #D9DDDF
dark-brown      #2C1810
coral-heart     #E2725B
```

---

## 🖼️ Système d'Images

### Composants d'Images

#### 1. Composant `Image` (Base)
```jsx
import Image from './components/Image';

// Utilisation simple
<Image
  src="/images/product.jpg"
  alt="Product"
  className="w-full h-full"
  objectFit="cover"
  lazy={true}  // Lazy loading par défaut
/>
```

**Features**:
- ✅ Lazy loading automatique
- ✅ Error handling avec fallback
- ✅ Optimisation automatique
- ✅ Animation de chargement

#### 2. Composant `Avatar`
```jsx
import { Avatar } from './components/Image';

// Avec image
<Avatar src="/avatar.jpg" name="Ahmed" size="md" />

// Avec initiales (pas d'image)
<Avatar name="Ahmed Belkacem" size="lg" />
// Affiche: AB
```

**Tailles**: `sm`, `md`, `lg`, `xl`

#### 3. Composant `ImageGallery`
```jsx
import { ImageGallery } from './components/Image';

<ImageGallery
  images={[
    "/images/product-1.jpg",
    "/images/product-2.jpg",
    "/images/product-3.jpg"
  ]}
  selectedIndex={0}
  onSelect={(index) => console.log(index)}
/>
```

**Features**:
- Image principale
- Miniatures navigables
- Sélection au clic

#### 4. Composant `ProgressiveImage`
```jsx
import { ProgressiveImage } from './components/Image';

<ProgressiveImage
  src="/high-res.jpg"
  placeholderSrc="/low-res.jpg"
  alt="Product"
  className="w-full"
/>
```

**Effet**: Charge une version floue d'abord, puis l'image haute résolution

#### 5. `ImagePlaceholder`
```jsx
import { ImagePlaceholder } from './components/Image';

// Types: 'product', 'boutique', 'avatar'
<ImagePlaceholder type="product" className="w-full h-56" />
```

---

## 🛠️ Utilities pour Images

### `imageUtils.js`

```javascript
import {
  getImageUrl,
  getThumbnailUrl,
  getGalleryImageUrl,
  optimizeImageUrl,
  getAvatarUrl,
  preloadImage,
  preloadImages,
  imageManager
} from './utils/imageUtils';

// Optimiser une image
const optimized = optimizeImageUrl('/images/product.jpg', 400, 80);
// Result: /images/product.jpg?w=400&q=80

// Obtenir URL miniature
const thumb = getThumbnailUrl('/images/product.jpg');
// w=150, q=70

// Obtenir URL galerie
const gallery = getGalleryImageUrl('/images/product.jpg');
// w=800, q=90

// Générer avatar avec initiales
const avatar = getAvatarUrl('Ahmed Belkacem', 128);

// Précharger une image
preloadImage('/images/product.jpg')
  .then(() => console.log('Image chargée'))
  .catch(() => console.log('Erreur de chargement'));

// Précharger plusieurs images
preloadImages([
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg'
]).then(() => console.log('Toutes chargées'));

// Utiliser le manager global
imageManager.getImage('/images/product.jpg', '/fallback.jpg');
imageManager.preload('/images/product.jpg');
imageManager.clearCache();
```

### `svgUtils.js`

```javascript
import {
  getDefaultImageUrl,
  createInitialAvatar,
  createInitialAvatarUrl,
  createGradientBg,
  createPattern
} from './utils/svgUtils';

// Obtenir image par défaut (SVG)
const defaultProduct = getDefaultImageUrl('PRODUCT');
const defaultBoutique = getDefaultImageUrl('BOUTIQUE');

// Créer avatar avec initiales
const avatarSvg = createInitialAvatar('AB', '#6E7F78', '#FFFFFF');

// En data URL
const avatarUrl = createInitialAvatarUrl('AB', '#6E7F78', '#FFFFFF');

// Créer gradient SVG
const gradient = createGradientBg('#6E7F78', '#D2B8A3');

// Créer pattern
const dots = createPattern('dots', '#8A908C', '#D9DDDF');
const lines = createPattern('lines', '#8A908C', '#D9DDDF');
const grid = createPattern('grid', '#8A908C', '#D9DDDF');
```

---

## 📁 Structure Dossiers Images

Créer dans `frontend/public/images/`:

```
frontend/public/images/
├── defaults/
│   ├── product.svg
│   ├── boutique.svg
│   ├── user.svg
│   └── category.svg
├── patterns/
│   ├── dots.svg
│   ├── lines.svg
│   └── gradient.svg
├── products/
│   ├── djellaba/
│   │   ├── 1.jpg
│   │   ├── 2.jpg
│   │   └── 3.jpg
│   └── ...
├── boutiques/
│   ├── dar-saffron.jpg
│   ├── riad-collection.jpg
│   └── ...
└── avatars/
    ├── user-1.jpg
    └── ...
```

---

## 🎯 Exemples d'Utilisation

### ProductCard avec Images Optimisées
```jsx
import Image from './components/Image';
import { getThumbnailUrl } from './utils/imageUtils';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl">
      <div className="relative h-56 bg-light-ash">
        {product.images?.[0] ? (
          <Image
            src={product.images[0].image_url}
            alt={product.name}
            className="w-full h-full"
            objectFit="cover"
            lazy={true}
          />
        ) : (
          <ImagePlaceholder type="product" className="w-full h-full" />
        )}
      </div>
      {/* ... rest of card */}
    </div>
  );
};
```

### BoutiqueCard avec Avatar
```jsx
import { Avatar } from './components/Image';

const BoutiqueCard = ({ boutique }) => {
  return (
    <div className="bg-white rounded-xl">
      <div className="h-44 bg-light-ash flex items-center justify-center">
        {boutique.logo ? (
          <Image src={boutique.logo} alt={boutique.name} />
        ) : (
          <Avatar name={boutique.name} size="xl" className="rounded-lg" />
        )}
      </div>
      {/* ... rest of card */}
    </div>
  );
};
```

### ProductDetailPage avec Gallery
```jsx
import { ImageGallery } from './components/Image';

const ProductDetailPage = ({ product }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ImageGallery
        images={product.images?.map(img => img.image_url) || []}
        onSelect={(index) => console.log(index)}
      />
      {/* ... product details */}
    </div>
  );
};
```

---

## 🚀 Optimisation des Images

### Format Recommandés
- **Product Images**: JPG ou WebP (max 800x800px)
- **Thumbnails**: JPG (150x150px, q=70)
- **Avatars**: SVG ou JPG (128x128px)
- **Logos**: PNG ou SVG (max 500x500px)

### Tailles Recommandées
```
Mobile:     400x400px max
Tablet:     600x600px max
Desktop:    800x800px max
Thumbnail:  150x150px
Avatar:     128x128px
Logo:       300x300px
```

### Qualité Recommandée
```
Thumbnails:  q=70 (petit, rapide)
Normal:      q=80 (équilibre)
Gallery:     q=90 (haute qualité)
Full-size:   q=95 (très haute)
```

---

## 🎨 Variables CSS Disponibles

```css
/* Couleurs Principales */
--primary: #6E7F78;
--secondary: #D2B8A3;
--accent: #B7C6C9;
--neutral: #8A908C;
--background: #D9DDDF;

/* Texte */
--text: #2C1810;
--text-light: #F5F3F1;
--text-muted: #8A908C;

/* Accents */
--heart: #E2725B;
--success: #6E9F78;
--error: #D97E7E;
--warning: #D2B354;

/* Ombres */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);

/* Espacements */
--radius: 0.75rem;
--radius-lg: 1rem;
```

---

## 📱 Responsive Design

### Breakpoints Tailwind
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Utilisation
```jsx
<div className="
  grid grid-cols-1       // Mobile: 1 colonne
  sm:grid-cols-2         // > 640px: 2 colonnes
  lg:grid-cols-3         // > 1024px: 3 colonnes
  gap-4
">
  {/* Items */}
</div>
```

---

## ✅ Checklist Images

- [ ] Utiliser `<Image />` au lieu de `<img />`
- [ ] Ajouter `alt` text descriptif
- [ ] Utiliser `lazy={true}` par défaut
- [ ] Fournir `fallback` si possible
- [ ] Optimiser tailles avant upload
- [ ] Utiliser format approprié (JPG/PNG/WebP/SVG)
- [ ] Tester sur mobile et desktop
- [ ] Vérifier performance (DevTools)
- [ ] Précharger images importantes
- [ ] Utiliser `objectFit` correct

---

## 🎬 Animations Images

### Fade In (défaut)
```jsx
<Image
  src="/image.jpg"
  className="transition-opacity duration-300"
/>
```

### Zoom Hover
```jsx
<div className="overflow-hidden rounded-xl">
  <Image
    src="/image.jpg"
    className="hover:scale-105 transition-transform duration-500"
  />
</div>
```

### Progressive Load
```jsx
<ProgressiveImage
  src="/high-res.jpg"
  placeholderSrc="/low-res.jpg"
/>
```

---

## 🔧 Configuration

### Tailwind Config
```js
theme: {
  extend: {
    colors: {
      'sage-green': '#6E7F78',
      'sand-beige': '#D2B8A3',
      'dusty-blue': '#B7C6C9',
      'olive-gray': '#8A908C',
      'light-ash': '#D9DDDF',
    }
  }
}
```

### Global CSS
```css
:root {
  --primary: #6E7F78;
  --secondary: #D2B8A3;
  /* ... autres variables */
}

body {
  background-color: var(--background);
  color: var(--text);
}
```

---

## 📊 Performance Metrics

### Cibles
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Optimisations
- ✅ Lazy loading
- ✅ Image compression
- ✅ Progressive enhancement
- ✅ Responsive images
- ✅ WebP fallback

---

## 🐛 Troubleshooting

### Image ne charge pas
1. Vérifier chemin du fichier
2. Vérifier permissions du serveur
3. Utiliser DevTools Network tab
4. Vérifier console pour erreurs

### Image floue
1. Vérifier taille originale
2. Augmenter qualité (q=90)
3. Vérifier objectFit
4. Vérifier resolution de l'écran

### Placeholder disparaît
1. Vérifier alt text
2. Vérifier fallback URL
3. Vérifier CSS opacity transitions
4. Vérifier onLoad callback

---

**Happy Image Optimizing! 📸**
