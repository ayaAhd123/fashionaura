<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Boutique;
use Illuminate\Support\Facades\Hash;

class BoutiqueOwnerSeeder extends Seeder
{
    public function run(): void
    {
        // Get all boutiques
        $boutiques = Boutique::all();

        $owners = [
            [
                'name' => 'Sarah Martinez',
                'email' => 'sarah@luxuryfashion.com',
                'phone' => '+212600000003',
                'avatar' => 'https://ui-avatars.com/api/?name=Sarah&background=ec489a&color=fff',
            ],
            [
                'name' => 'Omar Benali',
                'email' => 'omar@streetstyle.ma',
                'phone' => '+212600000004',
                'avatar' => 'https://ui-avatars.com/api/?name=Omar&background=14b8a6&color=fff',
            ],
            [
                'name' => 'Leila Mansouri',
                'email' => 'leila@casablanca-boutique.com',
                'phone' => '+212600000005',
                'avatar' => 'https://ui-avatars.com/api/?name=Leila&background=f59e0b&color=fff',
            ],
            [
                'name' => 'Karim Idrissi',
                'email' => 'karim@modernwear.ma',
                'phone' => '+212600000006',
                'avatar' => 'https://ui-avatars.com/api/?name=Karim&background=3b82f6&color=fff',
            ],
            [
                'name' => 'Nadia Tazi',
                'email' => 'nadia@elitecollection.com',
                'phone' => '+212600000007',
                'avatar' => 'https://ui-avatars.com/api/?name=Nadia&background=8b5cf6&color=fff',
            ],
        ];

        foreach ($owners as $index => $ownerData) {
            if (isset($boutiques[$index])) {
                User::create([
                    'name' => $ownerData['name'],
                    'email' => $ownerData['email'],
                    'password' => Hash::make('password123'),
                    'avatar' => $ownerData['avatar'],
                    'phone' => $ownerData['phone'],
                    'role' => 'boutique_owner',
                    'boutique_id' => $boutiques[$index]->id,
                    'is_active' => true,
                ]);
            }
        }

        $this->command->info('✅ Boutique owners created successfully!');
    }
}