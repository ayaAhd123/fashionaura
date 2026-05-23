<?php 

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // ✔️ user relation
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // ✔️ total price
            $table->decimal('total', 10, 2);

            // ✔️ status
            $table->string('status')->default('pending');

            // ✔️ contact info
            $table->string('address')->nullable();
            $table->string('phone')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};