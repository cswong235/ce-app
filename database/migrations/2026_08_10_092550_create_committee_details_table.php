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
        Schema::create('committee_details', function (Blueprint $table) {
            $table->foreignId('committee_id')->primary()->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['chair', 'co_chair', 'committee', 'system_admin']);
            $table->date('term_start_date')->nullable();
            $table->date('term_end_date')->nullable();
            $table->string('google_id')->nullable()->unique();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_details');
    }
};
