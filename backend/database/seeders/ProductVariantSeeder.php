<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductVariant;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        $sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        $colors = ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Beige'];

        $products = Product::all();

        foreach ($products as $product) {
            // Créer 2-3 variantes par produit
            $productSizes = array_slice($sizes, 0, 3);
            $productColors = array_slice($colors, 0, 2);

            foreach ($productSizes as $size) {
                foreach ($productColors as $color) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'size' => $size,
                        'color' => $color,
                        'stock_quantity' => rand(5, 20),
                        'price_override' => null,
                    ]);
                }
            }
        }
    }
}
