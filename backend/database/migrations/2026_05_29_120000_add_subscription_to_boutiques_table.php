<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            if (!Schema::hasColumn('boutiques', 'plan')) {
                $table->string('plan')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('boutiques', 'subscription_status')) {
                $table->string('subscription_status')->default('inactive')->after('plan');
            }
            if (!Schema::hasColumn('boutiques', 'subscription_paid_at')) {
                $table->timestamp('subscription_paid_at')->nullable()->after('subscription_status');
            }
            if (!Schema::hasColumn('boutiques', 'payment_reference')) {
                $table->string('payment_reference')->nullable()->after('subscription_paid_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            $table->dropColumn(['plan', 'subscription_status', 'subscription_paid_at', 'payment_reference']);
        });
    }
};
