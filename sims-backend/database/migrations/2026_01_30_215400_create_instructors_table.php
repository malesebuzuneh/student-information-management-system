<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructors', function (Blueprint $table) {
            $table->id();
            $table->string('instructor_id')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('phone', 20)->nullable();
            $table->string('qualification')->nullable();
            $table->text('specialization')->nullable();
            $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructors');
    }
};
