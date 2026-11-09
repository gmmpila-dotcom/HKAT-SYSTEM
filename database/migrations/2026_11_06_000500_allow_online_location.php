<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutoring_sessions', function (Blueprint $table) {
            $table->string('location_type', 20)->default('onsite')->change();
        });
    }

    public function down(): void
    {
    }
};