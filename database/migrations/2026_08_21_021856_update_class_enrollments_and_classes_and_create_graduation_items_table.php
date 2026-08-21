<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('class_enrollments', function (Blueprint $table) {
            $table->timestamp('left_at')->nullable();
            $table->timestamp('completed_at')->nullable();
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->date('graduation_date')->nullable();
        });

        Schema::create('graduation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->string('item_name');
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('class_enrollments', function (Blueprint $table) {
            $table->dropColumn(['left_at', 'completed_at']);
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('graduation_date');
        });

        Schema::dropIfExists('graduation_items');
    }
};