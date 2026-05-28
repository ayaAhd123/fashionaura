<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boutique_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boutique_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('total_views')->default(0);
            $table->integer('unique_visitors')->default(0);
            $table->integer('total_orders')->default(0);
            $table->decimal('total_revenue', 10, 2)->default(0);
            $table->integer('products_sold')->default(0);
            $table->decimal('average_order_value', 10, 2)->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0);
            $table->json('top_products')->nullable();
            $table->timestamps();
            
            $table->unique(['boutique_id', 'date']);
            $table->index(['date', 'boutique_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boutique_analytics');
    }
};