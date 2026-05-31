<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@fashionaura.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'avatar' => 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff',
                'phone' => '+212600000001',
                'role' => 'admin',
                'boutique_id' => null,
                'is_active' => true,
            ]
        );

        $this->command?->info('✅ Admin : admin@fashionaura.com / password123');
    }
}
