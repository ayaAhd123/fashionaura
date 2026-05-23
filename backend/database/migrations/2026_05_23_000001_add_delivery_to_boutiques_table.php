<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->boolean('offers_delivery')->default(true)->after('is_active');
            $table->string('delivery_scope')->default('national')->after('offers_delivery');
            $table->text('delivery_note')->nullable()->after('delivery_scope');
        });
    }

    public function down(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->dropColumn(['offers_delivery', 'delivery_scope', 'delivery_note']);
        });
    }
};
