<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('views')->default(0);
            $table->integer('clicks')->default(0);
            $table->integer('added_to_cart')->default(0);
            $table->integer('purchases')->default(0);
            $table->decimal('revenue', 10, 2)->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['product_id', 'date']);
            $table->index(['date', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_analytics');
    }
};