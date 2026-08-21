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
        Schema::create('course_profile_prereq', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_profile_id')->constrained('course_profiles')->cascadeOnDelete();
            $table->foreignId('prereq_course_profile_id')->constrained('course_profiles')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
 
            $table->unique(
                ['course_profile_id', 'prereq_course_profile_id'],
                'course_profile_prereq_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_profile_prereq');
    }
};
