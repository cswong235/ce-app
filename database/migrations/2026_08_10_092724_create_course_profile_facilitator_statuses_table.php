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
        Schema::create('facilitator_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_profile_id')->constrained('course_profiles')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['potential', 'appointed'])->default('potential');
            $table->timestamp('appointed_at')->nullable();
            $table->timestamps();
 
            $table->unique(['course_profile_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facilitator_statuses');
    }
};
