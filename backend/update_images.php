<?php
use App\Models\Boutique;
use App\Models\ProductImage;
use App\Models\Product;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Update boutiques
Boutique::query()->update([
    'logo' => '/images/boutique_logo.png',
    'banner' => '/images/boutique_banner.png'
]);

// Update product images
$products = Product::all();
foreach ($products as $index => $product) {
    // 50% dress, 50% jacket
    $imgUrl = ($index % 2 == 0) ? '/images/product_dress.png' : '/images/product_jacket.png';
    // delete old ones
    $product->images()->delete();
    $product->images()->create([
        'image_url' => $imgUrl,
        'is_primary' => true,
        'alt_text' => $product->name,
        'order' => 0
    ]);
}
echo "Images updated successfully!\n";
