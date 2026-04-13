<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@fashionaura.com',
            'password' => Hash::make('password123'),
            'avatar' => 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff',
            'phone' => '+212600000001',
            'role' => 'admin',
            'boutique_id' => null,
            'is_active' => true,
        ]);

        // Create second admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@fashionaura.com',
            'password' => Hash::make('password123'),
            'avatar' => 'https://ui-avatars.com/api/?name=Super&background=8b5cf6&color=fff',
            'phone' => '+212600000002',
            'role' => 'admin',
            'boutique_id' => null,
            'is_active' => true,
        ]);

        $this->command->info('✅ Admin users created successfully!');
    }
}
