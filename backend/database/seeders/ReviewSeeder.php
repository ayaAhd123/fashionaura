<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\User;
use App\Models\Product;
use App\Models\Boutique;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Créer quelques utilisateurs de test
        $users = User::factory(5)->create();

        $products = Product::all();
        $boutiques = Boutique::all();

        // Avis pour les produits
        foreach ($products as $product) {
            for ($i = 0; $i < rand(2, 4); $i++) {
                Review::create([
                    'user_id' => $users->random()->id,
                    'product_id' => $product->id,
                    'boutique_id' => null,
                    'rating' => rand(3, 5),
                    'comment' => $this->getRandomComment(),
                ]);
            }
        }

        // Avis pour les boutiques
        foreach ($boutiques as $boutique) {
            for ($i = 0; $i < rand(1, 3); $i++) {
                Review::create([
                    'user_id' => $users->random()->id,
                    'boutique_id' => $boutique->id,
                    'product_id' => null,
                    'rating' => rand(3, 5),
                    'comment' => $this->getRandomBoutiqueComment(),
                ]);
            }
        }
    }

    private function getRandomComment(): string
    {
        $comments = [
            'Excellent produit, très satisfait de mon achat!',
            'Très bonne qualité, livraison rapide.',
            'Conforme à la description, je recommande.',
            'Produit magnifique, meilleure boutique!',
            'Excellent rapport qualité-prix.',
            'J\'adore! Vais commander à nouveau.',
            'Très contente de mon achat, merci!',
        ];

        return $comments[array_rand($comments)];
    }

    private function getRandomBoutiqueComment(): string
    {
        $comments = [
            'Excellent service client, très professionnel.',
            'Boutique magnifique, ambiance fantastique!',
            'Très belle sélection de vêtements.',
            'Le personnel est accueillant et attentif.',
            'Boutique incontournable de la ville!',
            'Collections de qualité toujours variée.',
        ];

        return $comments[array_rand($comments)];
    }
}
