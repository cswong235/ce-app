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
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_name');
            $table->text('event_description')->nullable();
            $table->dateTime('event_at')->nullable();
            $table->dateTime('remind_at');
            $table->json('roles')->nullable();
            $table->boolean('notify_self')->default(false);
            $table->json('notification_methods');
            $table->enum('status', ['upcoming', 'passed'])->default('upcoming');
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
