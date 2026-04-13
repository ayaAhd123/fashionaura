<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductImage;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();

        foreach ($products as $product) {
            // Image principale
            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => 'https://via.placeholder.com/600x800?text=' . urlencode($product->name),
                'is_primary' => true,
                'sort_order' => 0,
            ]);

            // 2-3 images supplémentaires
            for ($i = 1; $i <= 2; $i++) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => 'https://via.placeholder.com/600x800?text=' . urlencode($product->name) . '+' . $i,
                    'is_primary' => false,
                    'sort_order' => $i,
                ]);
            }
        }
    }
}
