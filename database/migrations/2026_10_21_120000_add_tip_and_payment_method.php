<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('tip_amount', 8, 2)->default(0);
            $table->string('method_label')->nullable();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('pay_type')->nullable();
            $table->string('pay_last4', 4)->nullable();
            $table->string('pay_name')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['tip_amount', 'method_label']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['pay_type', 'pay_last4', 'pay_name']);
        });
    }
};