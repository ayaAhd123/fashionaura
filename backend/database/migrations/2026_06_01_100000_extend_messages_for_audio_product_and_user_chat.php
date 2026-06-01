<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->string('kind')->default('boutique')->after('id');
            $table->foreignId('peer_user_id')->nullable()->after('customer_id')->constrained('users')->cascadeOnDelete();
            $table->index(['kind', 'customer_id', 'peer_user_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->string('type')->default('text')->after('user_id');
            $table->string('audio_path')->nullable()->after('body');
            $table->foreignId('product_id')->nullable()->after('audio_path')->constrained()->nullOnDelete();
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->text('body')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn(['type', 'audio_path', 'product_id']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['peer_user_id']);
            $table->dropIndex(['kind', 'customer_id', 'peer_user_id']);
            $table->dropColumn(['kind', 'peer_user_id']);
        });
    }
};
