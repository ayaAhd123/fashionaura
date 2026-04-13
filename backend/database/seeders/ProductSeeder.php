<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Boutique;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $boutiques = Boutique::all();
        
        $products = [
            [
                'name' => 'Elegant Evening Dress',
                'description' => 'Stunning evening dress perfect for special occasions.',
                'price' => 1200,
                'promo_price' => 899,
                'image' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
                'category' => 'dress',
                'style' => 'luxury',
                'sizes' => ['XS', 'S', 'M', 'L'],
                'colors' => ['Black', 'Red', 'Navy'],
                'stock' => 15,
            ],
            [
                'name' => 'Casual Denim Jacket',
                'description' => 'Classic denim jacket for everyday wear.',
                'price' => 450,
                'promo_price' => 350,
                'image' => 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2',
                'category' => 'jacket',
                'style' => 'casual',
                'sizes' => ['S', 'M', 'L', 'XL'],
                'colors' => ['Blue', 'Black'],
                'stock' => 25,
            ],
            [
                'name' => 'Leather Handbag',
                'description' => 'Premium leather handbag with elegant design.',
                'price' => 850,
                'promo_price' => null,
                'image' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
                'category' => 'bag',
                'style' => 'luxury',
                'sizes' => ['One Size'],
                'colors' => ['Brown', 'Black', 'Tan'],
                'stock' => 10,
            ],
            [
                'name' => 'Sneakers Urban',
                'description' => 'Comfortable urban sneakers for daily wear.',
                'price' => 350,
                'promo_price' => 299,
                'image' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
                'category' => 'shoes',
                'style' => 'streetwear',
                'sizes' => ['38', '39', '40', '41', '42'],
                'colors' => ['White', 'Black', 'Gray'],
                'stock' => 30,
            ],
            [
                'name' => 'Silk Blouse',
                'description' => 'Elegant silk blouse for professional and casual wear.',
                'price' => 550,
                'promo_price' => 450,
                'image' => 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909',
                'category' => 'top',
                'style' => 'elegant',
                'sizes' => ['XS', 'S', 'M', 'L'],
                'colors' => ['White', 'Cream', 'Pink'],
                'stock' => 20,
            ],
            [
                'name' => 'Wool Coat',
                'description' => 'Warm wool coat for winter season.',
                'price' => 1800,
                'promo_price' => 1499,
                'image' => 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543',
                'category' => 'coat',
                'style' => 'luxury',
                'sizes' => ['S', 'M', 'L'],
                'colors' => ['Gray', 'Camel', 'Black'],
                'stock' => 8,
            ],
            [
                'name' => 'Summer Maxi Dress',
                'description' => 'Light and breezy maxi dress for summer.',
                'price' => 320,
                'promo_price' => 249,
                'image' => 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
                'category' => 'dress',
                'style' => 'casual',
                'sizes' => ['S', 'M', 'L'],
                'colors' => ['Floral', 'Blue', 'Yellow'],
                'stock' => 35,
            ],
            [
                'name' => 'Designer Sunglasses',
                'description' => 'Stylish sunglasses from premium collection.',
                'price' => 650,
                'promo_price' => null,
                'image' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
                'category' => 'accessories',
                'style' => 'luxury',
                'sizes' => ['One Size'],
                'colors' => ['Black', 'Gold', 'Silver'],
                'stock' => 12,
            ],
        ];
        
        foreach ($boutiques as $boutique) {
            // Each boutique gets 5-8 products
            $numProducts = rand(5, 8);
            $selectedProducts = collect($products)->random(min($numProducts, count($products)));
            
            foreach ($selectedProducts as $productData) {
                $productData['boutique_id'] = $boutique->id;
                $productData['is_active'] = true;
                Product::create($productData);
            }
        }
        
        $this->command->info('✅ Products seeded!');
    }
}