<?php

namespace Database\Seeders;

use App\Models\Boutique;
use App\Models\Category;
use App\Models\City;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

/**
 * Enrichit le catalogue Tanger : mariage, homme, cadeaux, soirée, casual, accessoires.
 * Idempotent — peut être relancé : php artisan db:seed --class=TangerFashionSeeder
 */
class TangerFashionSeeder extends Seeder
{
    public function run(): void
    {
        $tanger = City::where('slug', 'tanger')->first();
        if (! $tanger) {
            $this->command?->warn('Ville Tanger introuvable — lancez CitySeeder d\'abord.');

            return;
        }

        $categories = Category::all()->keyBy('slug');

        $boutiques = [
            [
                'name' => 'Cap Spartel Mariée',
                'slug' => 'cap-spartel-mariee',
                'description' => 'Spécialiste mariage à Tanger : takchitas, caftans de cérémonie et tenues d\'invitées brodées main.',
                'address' => 'Route de Cap Spartel, Tanger',
                'phone' => '+212 5 39 94 10 00',
                'email' => 'contact@capspartelmariee.ma',
                'website' => 'https://capspartelmariee.ma',
                'category' => 'luxury',
                'is_verified' => true,
                'rating' => 4.8,
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Livraison soignée pour tenues de mariage partout au Maroc.',
            ],
            [
                'name' => 'Bab Kasbah Homme',
                'slug' => 'bab-kasbah-homme',
                'description' => 'Mode masculine à Tanger : costumes, djellabas modernes, chemises et babouches artisanales.',
                'address' => 'Place du Petit Socco, Tanger',
                'phone' => '+212 5 39 94 20 00',
                'email' => 'contact@babkasbahhomme.ma',
                'category' => 'casual',
                'is_verified' => true,
                'rating' => 4.5,
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Expédition vers Casablanca, Rabat et Marrakech.',
            ],
            [
                'name' => 'Azulejos & Co',
                'slug' => 'azulejos-co',
                'description' => 'Accessoires et cadeaux inspirés des azulejos de Tanger : foulards, bijoux, ceintures sfifa.',
                'address' => 'Avenue d\'Espagne, Tanger',
                'phone' => '+212 5 39 94 30 00',
                'email' => 'contact@azulejosco.ma',
                'category' => 'luxury',
                'is_verified' => true,
                'rating' => 4.6,
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Idéal pour offrir — emballage cadeau inclus.',
            ],
            [
                'name' => 'Malabata Summer',
                'slug' => 'malabata-summer',
                'description' => 'Style décontracté bord de mer : robes lin, sandales et sacs artisanaux à Malabata.',
                'address' => 'Corniche de Malabata, Tanger',
                'phone' => '+212 5 39 94 40 00',
                'email' => 'contact@malabatasummer.ma',
                'category' => 'casual',
                'is_verified' => false,
                'rating' => 4.2,
                'offers_delivery' => true,
                'delivery_scope' => 'regional',
                'delivery_note' => 'Livraison nord du Maroc et grandes villes.',
            ],
        ];

        $boutiqueIds = [];
        foreach ($boutiques as $data) {
            $media = DemoMediaUrls::boutique($data['slug']);
            $boutique = Boutique::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'city_id' => $tanger->id,
                    'logo' => $media['logo'],
                    'banner' => $media['banner'],
                    'is_active' => true,
                ])
            );
            $boutiqueIds[$data['slug']] = $boutique->id;
        }

        $existingSlugs = Boutique::where('city_id', $tanger->id)->pluck('id', 'slug');

        $products = [
            // —— Tanger Élégance ——
            [
                'slug' => 'robe-soiree-mediterranee',
                'boutique_slug' => 'tanger-elegance',
                'category' => 'robes',
                'name' => 'Robe Soirée Méditerranée',
                'price' => 980,
                'discount_price' => 850,
                'description' => 'Robe longue satinée pour soirée ou mariage invitée. Couleur sable et détails dorés.',
                'style' => 'luxury',
                'rating' => 4.6,
            ],
            [
                'slug' => 'tailleur-femme-executive',
                'boutique_slug' => 'tanger-elegance',
                'category' => 'chemises',
                'name' => 'Tailleur Femme Executive',
                'price' => 650,
                'description' => 'Tailleur deux pièces pour bureau ou événement professionnel à Tanger.',
                'style' => 'luxury',
                'rating' => 4.4,
            ],
            // —— Médina Chic ——
            [
                'slug' => 'takchita-royale-brodee',
                'boutique_slug' => 'medina-chic',
                'category' => 'robes',
                'name' => 'Takchita Royale Brodée',
                'price' => 2400,
                'discount_price' => 2100,
                'description' => 'Takchita traditionnelle brodée main pour mariage marocain. Ceinture sfifa incluse.',
                'style' => 'luxury',
                'rating' => 4.9,
            ],
            [
                'slug' => 'caftan-mariage-perle',
                'boutique_slug' => 'medina-chic',
                'category' => 'robes',
                'name' => 'Caftan Mariage Perlé',
                'price' => 1650,
                'description' => 'Caftan de mariage avec perles et broderie argentée. Tenue traditionnelle élégante.',
                'style' => 'luxury',
                'rating' => 4.8,
            ],
            [
                'slug' => 'ensemble-henna-dore',
                'boutique_slug' => 'medina-chic',
                'category' => 'robes',
                'name' => 'Ensemble Henna Doré',
                'price' => 890,
                'description' => 'Ensemble henna deux pièces doré et crème pour cérémonie traditionnelle.',
                'style' => 'luxury',
                'rating' => 4.7,
            ],
            // —— Détroit Fashion ——
            [
                'slug' => 'bomber-street-tanger',
                'boutique_slug' => 'detroit-fashion',
                'category' => 'chemises',
                'name' => 'Bomber Street Tanger',
                'price' => 450,
                'description' => 'Bomber unisexe streetwear, broderie discrète du détroit. Look casual tendance.',
                'style' => 'streetwear',
                'rating' => 4.3,
            ],
            [
                'slug' => 'hoodie-coton-bio',
                'boutique_slug' => 'detroit-fashion',
                'category' => 'chemises',
                'name' => 'Hoodie Coton Bio',
                'price' => 320,
                'description' => 'Sweat à capuche coton bio, coupe relaxed. Idéal cadeau casual.',
                'style' => 'casual',
                'rating' => 4.2,
            ],
            // —— Cap Spartel Mariée ——
            [
                'slug' => 'takchita-cristal-blanc',
                'boutique_slug' => 'cap-spartel-mariee',
                'category' => 'robes',
                'name' => 'Takchita Cristal Blanc',
                'price' => 3200,
                'description' => 'Takchita blanche cristaux pour mariée. Haut de gamme, sur mesure possible.',
                'style' => 'luxury',
                'rating' => 4.9,
            ],
            [
                'slug' => 'caftan-invite-emeraude',
                'boutique_slug' => 'cap-spartel-mariee',
                'category' => 'robes',
                'name' => 'Caftan Invité Émeraude',
                'price' => 1100,
                'description' => 'Caftan invitée mariage couleur émeraude, broderie fine.',
                'style' => 'luxury',
                'rating' => 4.7,
            ],
            [
                'slug' => 'voile-brode-mariage',
                'boutique_slug' => 'cap-spartel-mariee',
                'category' => 'accessoires',
                'name' => 'Voile Brodé Mariage',
                'price' => 380,
                'description' => 'Voile léger brodé main pour compléter une tenue de mariage.',
                'style' => 'luxury',
                'rating' => 4.5,
            ],
            // —— Bab Kasbah Homme ——
            [
                'slug' => 'costume-lin-beige-homme',
                'boutique_slug' => 'bab-kasbah-homme',
                'category' => 'chemises',
                'name' => 'Costume Lin Beige Homme',
                'price' => 890,
                'description' => 'Costume lin beige pour mariage ou bureau. Coupe slim moderne.',
                'style' => 'luxury',
                'rating' => 4.6,
            ],
            [
                'slug' => 'djellaba-moderne-gris',
                'boutique_slug' => 'bab-kasbah-homme',
                'category' => 'chemises',
                'name' => 'Djellaba Moderne Gris',
                'price' => 520,
                'description' => 'Djellaba homme grise, finitions soignées. Tradition revisitée.',
                'style' => 'casual',
                'rating' => 4.4,
            ],
            [
                'slug' => 'chemise-qamis-blanc',
                'boutique_slug' => 'bab-kasbah-homme',
                'category' => 'chemises',
                'name' => 'Chemise Qamis Blanc',
                'price' => 240,
                'description' => 'Qamis blanc coton premium pour homme. Coupes S à XXL.',
                'style' => 'casual',
                'rating' => 4.3,
            ],
            [
                'slug' => 'babouches-cuir-tanger',
                'boutique_slug' => 'bab-kasbah-homme',
                'category' => 'chaussures',
                'name' => 'Babouches Cuir Tanger',
                'price' => 280,
                'description' => 'Babouches cuir artisanal homme, confortables pour cérémonie.',
                'style' => 'luxury',
                'rating' => 4.5,
            ],
            // —— Azulejos & Co ——
            [
                'slug' => 'foulard-soie-azulejos',
                'boutique_slug' => 'azulejos-co',
                'category' => 'accessoires',
                'name' => 'Foulard Soie Azulejos',
                'price' => 190,
                'description' => 'Foulard soie motifs azulejos bleu et blanc. Parfait cadeau femme.',
                'style' => 'luxury',
                'rating' => 4.6,
            ],
            [
                'slug' => 'ceinture-sfifa-or',
                'boutique_slug' => 'azulejos-co',
                'category' => 'accessoires',
                'name' => 'Ceinture Sfifa Or',
                'price' => 350,
                'description' => 'Ceinture sfifa dorée pour caftan ou takchita. Accessoire mariage.',
                'style' => 'luxury',
                'rating' => 4.7,
            ],
            [
                'slug' => 'boucles-azulejos-bleu',
                'boutique_slug' => 'azulejos-co',
                'category' => 'bijoux',
                'name' => 'Boucles Azulejos Bleu',
                'price' => 220,
                'description' => 'Boucles d\'oreilles émaillées inspiration Tanger. Idée cadeau.',
                'style' => 'luxury',
                'rating' => 4.4,
            ],
            [
                'slug' => 'coffret-cadeau-parfum-foulard',
                'boutique_slug' => 'azulejos-co',
                'category' => 'accessoires',
                'name' => 'Coffret Cadeau Parfum & Foulard',
                'price' => 480,
                'discount_price' => 420,
                'description' => 'Coffret cadeau : foulard soie + parfum floral. Emballage premium.',
                'style' => 'luxury',
                'rating' => 4.8,
            ],
            // —— Malabata Summer ——
            [
                'slug' => 'robe-lin-plage',
                'boutique_slug' => 'malabata-summer',
                'category' => 'robes',
                'name' => 'Robe Lin Plage',
                'price' => 290,
                'description' => 'Robe lin légère bord de mer. Casual chic pour été à Tanger.',
                'style' => 'casual',
                'rating' => 4.2,
            ],
            [
                'slug' => 'sandales-cuir-naturel',
                'boutique_slug' => 'malabata-summer',
                'category' => 'chaussures',
                'name' => 'Sandales Cuir Naturel',
                'price' => 210,
                'description' => 'Sandales cuir naturel unisexe. Confortables pour la corniche.',
                'style' => 'casual',
                'rating' => 4.1,
            ],
            [
                'slug' => 'sac-paille-artisanal',
                'boutique_slug' => 'malabata-summer',
                'category' => 'sacs',
                'name' => 'Sac Paille Artisanal',
                'price' => 160,
                'description' => 'Sac paille tressé main. Petit prix, parfait cadeau estival.',
                'style' => 'casual',
                'rating' => 4.0,
            ],
        ];

        foreach ($products as $data) {
            $boutiqueId = $boutiqueIds[$data['boutique_slug']] ?? $existingSlugs[$data['boutique_slug']] ?? null;
            if (! $boutiqueId) {
                continue;
            }

            $category = $categories[$data['category']] ?? $categories['robes'];

            $product = Product::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'boutique_id' => $boutiqueId,
                    'category_id' => $category->id,
                    'name' => $data['name'],
                    'price' => $data['price'],
                    'discount_price' => $data['discount_price'] ?? null,
                    'stock_quantity' => $data['stock_quantity'] ?? rand(8, 25),
                    'description' => $data['description'],
                    'style' => $data['style'],
                    'rating' => $data['rating'],
                    'is_active' => true,
                ]
            );

            $this->seedProductImages($product);
            $this->seedProductVariants($product);
        }

        $this->command?->info('Catalogue Tanger enrichi : '.Product::whereHas('boutique.city', fn ($q) => $q->where('slug', 'tanger'))->count().' produits.');
    }

    private function seedProductImages(Product $product): void
    {
        if ($product->images()->exists()) {
            return;
        }

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

    private function seedProductVariants(Product $product): void
    {
        if ($product->variants()->exists()) {
            return;
        }

        foreach (['S', 'M', 'L'] as $size) {
            foreach (['Noir', 'Beige'] as $color) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'size' => $size,
                    'color' => $color,
                    'stock_quantity' => rand(5, 15),
                    'price_override' => null,
                ]);
            }
        }
    }
}
