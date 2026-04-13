<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing roles from 'client' to 'customer'
        DB::table('users')
            ->where('role', 'client')
            ->update(['role' => 'customer']);
    }

    public function down(): void
    {
        // Revert back if needed
        DB::table('users')
            ->where('role', 'customer')
            ->update(['role' => 'client']);
    }
};