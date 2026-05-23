<?php

namespace Database\Seeders;

use App\Models\Boutique;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\City;
use Illuminate\Database\Seeder;

/**
 * Photos en ligne (Unsplash) pour boutiques, produits et villes.
 * Exécutable seul : php artisan db:seed --class=DemoMediaSeeder
 */
class DemoMediaSeeder extends Seeder
{
  public function run(): void
  {
    foreach (Boutique::all() as $boutique) {
      $media = DemoMediaUrls::boutique($boutique->slug);
      $boutique->update([
        'logo' => $media['logo'],
        'banner' => $media['banner'],
      ]);
    }

    foreach (City::all() as $city) {
      $city->update(['image' => DemoMediaUrls::city($city->slug)]);
    }

    foreach (Product::all() as $product) {
      $urls = DemoMediaUrls::product($product->slug);

      ProductImage::where('product_id', $product->id)->delete();

      foreach ($urls as $index => $url) {
        ProductImage::create([
          'product_id' => $product->id,
          'image_url' => $url,
          'is_primary' => $index === 0,
          'sort_order' => $index,
        ]);
      }
    }

    $this->command?->info('Photos demo appliquées (boutiques, produits, villes).');
  }
}
