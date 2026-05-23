<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductImage;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Product::all() as $product) {
            $urls = DemoMediaUrls::product($product->slug);

            foreach ($urls as $index => $url) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $url,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }
    }
}
