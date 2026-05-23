<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Boutique;

class BoutiqueDeliverySeeder extends Seeder
{
    public function run(): void
    {
        $delivery = [
            'tanger-elegance' => [
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Livraison dans tout le Maroc sous 3 à 5 jours.',
            ],
            'medina-chic' => [
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Expédition vers Casablanca, Rabat, Marrakech et autres villes.',
            ],
            'detroit-fashion' => [
                'offers_delivery' => true,
                'delivery_scope' => 'regional',
                'delivery_note' => 'Livraison Tanger, Tétouan et nord du Maroc.',
            ],
            'elegance-casa' => [
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Livraison express nationale disponible.',
            ],
            'marrakech-chic' => [
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Livraison partout au Maroc, emballage soigné.',
            ],
            'rabat-style' => [
                'offers_delivery' => true,
                'delivery_scope' => 'national',
                'delivery_note' => 'Livraison vers toutes les grandes villes marocaines.',
            ],
            'fes-tradition' => [
                'offers_delivery' => false,
                'delivery_scope' => 'local',
                'delivery_note' => 'Retrait en boutique à Fès uniquement.',
            ],
        ];

        foreach ($delivery as $slug => $data) {
            Boutique::where('slug', $slug)->update($data);
        }
    }
}
