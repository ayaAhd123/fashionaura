<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Phase test — seeders minimaux (admin + Sarah uniquement)…');

        $this->call([
            CitySeeder::class,
            CategorySeeder::class,
            AdminUserSeeder::class,
            SarahBoutiqueSeeder::class,
        ]);

        $this->command?->info('Terminé. Comptes :');
        $this->command?->line('  Admin  → admin@fashionaura.com / password123');
        $this->command?->line('  Sarah  → sarah@luxuryfashion.com / password123');
    }
}
