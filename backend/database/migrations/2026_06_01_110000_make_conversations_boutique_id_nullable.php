<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['boutique_id']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('boutique_id')->nullable()->change();
            $table->foreign('boutique_id')->references('id')->on('boutiques')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['boutique_id']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->foreignId('boutique_id')->nullable(false)->change();
            $table->foreign('boutique_id')->references('id')->on('boutiques')->cascadeOnDelete();
        });
    }
};
