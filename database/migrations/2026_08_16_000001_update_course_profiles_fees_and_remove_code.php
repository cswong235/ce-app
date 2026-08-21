<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('course_profiles', function (Blueprint $table) {
            $table->decimal('early_bird_fees', 10, 2)->nullable()->after('target_audience');
            $table->decimal('standard_fees', 10, 2)->nullable()->after('early_bird_fees');
        });

        DB::table('course_profiles')->update([
            'early_bird_fees' => DB::raw('fees'),
            'standard_fees' => null,
        ]);

        Schema::table('course_profiles', function (Blueprint $table) {
            $table->dropColumn('fees');
            $table->dropColumn('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_profiles', function (Blueprint $table) {
            $table->decimal('fees', 10, 2)->nullable()->after('target_audience');
            $table->string('code')->nullable()->after('title');
        });

        DB::table('course_profiles')->update([
            'fees' => DB::raw('early_bird_fees'),
        ]);

        Schema::table('course_profiles', function (Blueprint $table) {
            $table->dropColumn('early_bird_fees');
            $table->dropColumn('standard_fees');
        });
    }
};
