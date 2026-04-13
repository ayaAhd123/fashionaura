<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');
        
        // First, create base data if not exists
        $this->call(CitySeeder::class);
        $this->call(BoutiqueSeeder::class);
        $this->call(ProductSeeder::class);
        
        // Then create dashboard related data
        $this->call(AdminUserSeeder::class);
        $this->call(BoutiqueOwnerSeeder::class);
        $this->call(DashboardDummyDataSeeder::class);
        
        $this->command->info('✅ Database seeding completed!');
    }
}