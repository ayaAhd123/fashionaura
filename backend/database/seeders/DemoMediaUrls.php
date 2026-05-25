<?php

namespace Database\Seeders;

/**
 * URLs médias partagées entre les seeders (Unsplash — usage démo).
 */
class DemoMediaUrls
{
  public static function boutique(string $slug): array
  {
    $map = [
      'tanger-elegance' => [
        'logo' => 'https://images.unsplash.com/photo-1487412720507-e576aa353780?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=450&fit=crop&q=80',
      ],
      'medina-chic' => [
        'logo' => 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=450&fit=crop&q=80',
      ],
      'detroit-fashion' => [
        'logo' => 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=450&fit=crop&q=80',
      ],
      'elegance-casa' => [
        'logo' => 'https://images.unsplash.com/photo-1583497019940-1c28c814b91f?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1483985988353-763728e1935b?w=1200&h=450&fit=crop&q=80',
      ],
      'marrakech-chic' => [
        'logo' => 'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=450&fit=crop&q=80',
      ],
      'rabat-style' => [
        'logo' => 'https://images.unsplash.com/photo-1539109136881-3be0616acf47?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=1200&h=450&fit=crop&q=80',
      ],
      'fes-tradition' => [
        'logo' => 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=1200&h=450&fit=crop&q=80',
      ],
      'cap-spartel-mariee' => [
        'logo' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&h=450&fit=crop&q=80',
      ],
      'bab-kasbah-homme' => [
        'logo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200&h=450&fit=crop&q=80',
      ],
      'azulejos-co' => [
        'logo' => 'https://images.unsplash.com/photo-1611591437281-460bf0a0b2c4?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=450&fit=crop&q=80',
      ],
      'malabata-summer' => [
        'logo' => 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop&q=80',
        'banner' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=450&fit=crop&q=80',
      ],
    ];

    return $map[$slug] ?? [
      'logo' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&q=80',
      'banner' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=450&fit=crop&q=80',
    ];
  }

  public static function product(string $slug): array
  {
    $map = [
      'robe-boheme-luxe' => [
        'https://images.unsplash.com/photo-1595777457583-95e059588314?w=600&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&q=80',
      ],
      'veste-lin-premium' => [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1594938298602-c814c564c4e8?w=600&h=800&fit=crop&q=80',
      ],
      'caftan-moderne-brode' => [
        'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=600&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583497019940-1c28c814b91f?w=600&h=800&fit=crop&q=80',
      ],
      'jupe-brode-marocaine' => [
        'https://images.unsplash.com/photo-1583497000140-28e8d84e033a?w=600&h=800&fit=crop&q=80',
      ],
      'blazer-oversize-noir' => [
        'https://images.unsplash.com/photo-1594938298602-c814c564c4e8?w=600&h=800&fit=crop&q=80',
      ],
      'pantalon-wide-leg' => [
        'https://images.unsplash.com/photo-1594633313593-bab3825d0f8d?w=600&h=800&fit=crop&q=80',
      ],
      'robe-soiree-glamour' => [
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop&q=80',
      ],
      'gandoura-femme-premium' => [
        'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=600&h=800&fit=crop&q=80',
      ],
      'chemise-classique-blanche' => [
        'https://images.unsplash.com/photo-1596755094514-f87e3aae836b?w=600&h=800&fit=crop&q=80',
      ],
      'sac-cuir-artisanal' => [
        'https://images.unsplash.com/photo-1590874103328-e188e96e6419?w=600&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&q=80',
      ],
      'takchita-royale-brodee' => [
        'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=600&h=800&fit=crop&q=80',
      ],
      'takchita-cristal-blanc' => [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop&q=80',
      ],
      'caftan-mariage-perle' => [
        'https://images.unsplash.com/photo-1583497019940-1c28c814b91f?w=600&h=800&fit=crop&q=80',
      ],
      'costume-lin-beige-homme' => [
        'https://images.unsplash.com/photo-1594938298602-c814c564c4e8?w=600&h=800&fit=crop&q=80',
      ],
      'foulard-soie-azulejos' => [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=800&fit=crop&q=80',
      ],
      'coffret-cadeau-parfum-foulard' => [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&q=80',
      ],
      'robe-lin-plage' => [
        'https://images.unsplash.com/photo-1595777457583-95e059588314?w=600&h=800&fit=crop&q=80',
      ],
    ];

    return $map[$slug] ?? [
      'https://images.unsplash.com/photo-1483985988353-763728e1935b?w=600&h=800&fit=crop&q=80',
    ];
  }

  /** Images par type de vêtement (seeders alertes stock, etc.) */
  public static function byType(string $type): array
  {
    return match ($type) {
      'robe' => [
        'https://images.unsplash.com/photo-1595777457583-95e059588314?w=600&h=800&fit=crop&q=80',
      ],
      'pantalon' => [
        'https://images.unsplash.com/photo-1594633313593-bab3825d0f8d?w=600&h=800&fit=crop&q=80',
      ],
      'chemise' => [
        'https://images.unsplash.com/photo-1596755094514-f87e3aae836b?w=600&h=800&fit=crop&q=80',
      ],
      'veste' => [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop&q=80',
      ],
      'sac' => [
        'https://images.unsplash.com/photo-1590874103328-e188e96e6419?w=600&h=800&fit=crop&q=80',
      ],
      'chaussure' => [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop&q=80',
      ],
      default => [
        'https://images.unsplash.com/photo-1483985988353-763728e1935b?w=600&h=800&fit=crop&q=80',
      ],
    };
  }

  public static function city(string $slug): string
  {
    $map = [
      'casablanca' => 'https://images.unsplash.com/photo-1569381000097-17b465257bee?w=800&h=500&fit=crop&q=80',
      'marrakech' => 'https://images.unsplash.com/photo-1518548419970-58e062341962?w=800&h=500&fit=crop&q=80',
      'rabat' => 'https://images.unsplash.com/photo-1555883647-787bb147bde7?w=800&h=500&fit=crop&q=80',
      'tanger' => 'https://images.unsplash.com/photo-1553603228-0f4033aa91d5?w=800&h=500&fit=crop&q=80',
      'fes' => 'https://images.unsplash.com/photo-1518548419970-58e062341962?w=800&h=500&fit=crop&q=80',
    ];

    return $map[$slug] ?? 'https://images.unsplash.com/photo-1569381000097-17b465257bee?w=800&h=500&fit=crop&q=80';
  }
}
