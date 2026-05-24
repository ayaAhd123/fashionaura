<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // First, check if boutique_id doesn't exist
            if (!Schema::hasColumn('users', 'boutique_id')) {
                $table->foreignId('boutique_id')->nullable()->constrained()->onDelete('set null');
            }
            
            // Add is_active if it doesn't exist
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['boutique_id']);
            $table->dropColumn(['boutique_id', 'is_active']);
        });
    }
};