<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Starting database seeding...');

        $this->call([
            CitySeeder::class,
            CategorySeeder::class,
            BoutiqueSeeder::class,
            BoutiqueDeliverySeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            ProductVariantSeeder::class,
            TangerFashionSeeder::class,
            ReviewSeeder::class,
            AdminUserSeeder::class,
            BoutiqueOwnerSeeder::class,
            DashboardDummyDataSeeder::class,
            StockAlertTestSeeder::class,
        ]);

        $this->command?->info('Database seeding completed.');
    }
}
