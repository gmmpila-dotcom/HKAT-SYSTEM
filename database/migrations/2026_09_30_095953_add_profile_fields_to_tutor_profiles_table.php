<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tutor_profiles', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('user_id');
            $table->string('credential')->nullable()->after('bio');
            $table->json('categories')->nullable()->after('specializations');
            $table->json('experience')->nullable()->after('categories');
        });
    }

    public function down(): void
    {
        Schema::table('tutor_profiles', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'credential', 'categories', 'experience']);
        });
    }
};
