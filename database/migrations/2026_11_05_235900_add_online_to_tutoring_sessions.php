<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutoring_sessions', function (Blueprint $table) {
            $table->string('room_code')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tutoring_sessions', function (Blueprint $table) {
            $table->dropColumn(['room_code', 'started_at', 'ended_at']);
        });
    }
};