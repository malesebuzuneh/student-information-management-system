<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('head_name')->nullable();
            $table->string('head_email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('location')->nullable();
            $table->integer('established_year')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('head_instructor_id')->nullable(); // Remove foreign key constraint for now
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
