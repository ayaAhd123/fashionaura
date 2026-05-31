<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Comptes "utilisateur normal" (client) pour tester l'auth/login.
 *
 * Usage : php artisan db:seed --class=CustomerUserSeeder
 */
class CustomerUserSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Aya Client',
                'email' => 'client@fashionaura.com',
                'phone' => '+212600000010',
            ],
            [
                'name' => 'Sofia Benali',
                'email' => 'sofia@fashionaura.com',
                'phone' => '+212600000011',
            ],
        ];

        foreach ($customers as $c) {
            User::firstOrCreate(
                ['email' => $c['email']],
                [
                    'name' => $c['name'],
                    'password' => Hash::make('password123'),
                    'phone' => $c['phone'],
                    'role' => 'customer',
                    'boutique_id' => null,
                    'is_active' => true,
                    'avatar' => 'https://ui-avatars.com/api/?name='.urlencode($c['name']).'&background=FCA5A5&color=3D0C0C',
                ]
            );
        }

        $this->command?->info('✅ Comptes client créés (client@fashionaura.com / password123).');
    }
}
