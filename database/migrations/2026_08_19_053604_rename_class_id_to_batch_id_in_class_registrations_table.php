<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('class_registrations', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
        });

        Schema::table('class_registrations', function (Blueprint $table) {
            $table->renameColumn('class_id', 'batch_id');
        });

        Schema::table('class_registrations', function (Blueprint $table) {
            $table->foreign('batch_id')->references('id')->on('batches')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('class_registrations', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
        });

        Schema::table('class_registrations', function (Blueprint $table) {
            $table->renameColumn('batch_id', 'class_id');
        });

        Schema::table('class_registrations', function (Blueprint $table) {
            $table->foreign('class_id')->references('id')->on('classes')->cascadeOnDelete();
        });
    }
};
