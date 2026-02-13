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
        Schema::table('students', function (Blueprint $table) {
            // Personal Information
            $table->string('student_id')->unique()->after('id'); // e.g., UGR/50001/26
            $table->date('date_of_birth')->nullable()->after('email');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('date_of_birth');
            $table->text('address')->nullable()->after('gender');
            $table->string('phone')->nullable()->after('address');
            $table->string('emergency_contact')->nullable()->after('phone');
            $table->string('emergency_phone')->nullable()->after('emergency_contact');
            
            // Academic Information
            $table->string('program')->nullable()->after('department_id'); // Degree/Diploma
            $table->integer('year')->default(1)->after('program'); // Academic year
            $table->integer('semester')->default(1)->after('year'); // Current semester
            $table->enum('admission_type', ['regular', 'transfer', 'international', 'scholarship'])->default('regular')->after('semester');
            $table->date('admission_date')->default(now())->after('admission_type');
            
            // System fields
            $table->enum('status', ['active', 'inactive', 'graduated', 'suspended'])->default('active')->after('admission_date');
            $table->boolean('is_first_login')->default(true)->after('status');
            $table->timestamp('last_login')->nullable()->after('is_first_login');
        });

        // Also enhance users table for first login tracking
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_first_login')->default(true)->after('role');
            $table->timestamp('last_login')->nullable()->after('is_first_login');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'student_id', 'date_of_birth', 'gender', 'address', 'phone',
                'emergency_contact', 'emergency_phone', 'program', 'year', 
                'semester', 'admission_type', 'admission_date', 'status',
                'is_first_login', 'last_login'
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_first_login', 'last_login']);
        });
    }
};