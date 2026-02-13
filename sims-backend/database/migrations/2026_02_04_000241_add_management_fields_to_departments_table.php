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
        Schema::table('departments', function (Blueprint $table) {
            $table->string('head_name')->nullable()->after('description');
            $table->string('head_email')->nullable()->after('head_name');
            $table->foreignId('head_instructor_id')->nullable()->constrained('instructors')->onDelete('set null')->after('head_email');
            $table->string('phone')->nullable()->after('head_instructor_id');
            $table->string('location')->nullable()->after('phone');
            $table->integer('established_year')->nullable()->after('location');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('established_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['head_instructor_id']);
            $table->dropColumn([
                'head_name',
                'head_email', 
                'head_instructor_id',
                'phone',
                'location',
                'established_year',
                'status'
            ]);
        });
    }
};
