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
        Schema::create('class_facilitators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('facilitator_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamps();

            $table->unique(['class_id', 'facilitator_id']);
        });

        DB::table('classes')
            ->whereNotNull('facilitator_id')
            ->select('id', 'facilitator_id')
            ->orderBy('id')
            ->each(function ($class) {
                DB::table('class_facilitators')->insert([
                    'class_id' => $class->id,
                    'facilitator_id' => $class->facilitator_id,
                    'assigned_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('facilitator_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('facilitator_id')->nullable()->after('course_profile_id')->constrained('users')->nullOnDelete();
        });

        DB::table('class_facilitators')
            ->select('class_id', 'facilitator_id')
            ->orderBy('id')
            ->get()
            ->unique('class_id')
            ->each(function ($pivot) {
                DB::table('classes')->where('id', $pivot->class_id)->update([
                    'facilitator_id' => $pivot->facilitator_id,
                ]);
            });

        Schema::dropIfExists('class_facilitators');
    }
};
