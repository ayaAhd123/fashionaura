<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->unsignedSmallInteger('stock_alert_threshold')
                ->nullable()
                ->after('is_active')
                ->comment('Seuil alerte stock personnalisé par le magasinier');
        });
    }

    public function down(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->dropColumn('stock_alert_threshold');
        });
    }
};
