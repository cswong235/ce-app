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
        Schema::table('classes', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('class_date');
            $table->date('end_date')->nullable()->after('start_date');
        });

        DB::table('classes')
            ->whereNotNull('class_date')
            ->update([
                'start_date' => DB::raw('class_date'),
            ]);

        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('class_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->date('class_date')->nullable()->after('id');
        });

        DB::table('classes')
            ->whereNotNull('start_date')
            ->update([
                'class_date' => DB::raw('start_date'),
            ]);

        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('start_date');
            $table->dropColumn('end_date');
        });
    }
};
