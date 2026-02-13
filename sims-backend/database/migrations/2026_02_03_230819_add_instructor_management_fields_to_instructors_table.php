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
        Schema::table('instructors', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('qualification')->nullable()->after('department_id');
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active')->after('qualification');
            $table->timestamp('archived_at')->nullable()->after('status');
            $table->boolean('is_first_login')->default(true)->after('archived_at');
            $table->timestamp('last_login')->nullable()->after('is_first_login');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructors', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'qualification',
                'status',
                'archived_at',
                'is_first_login',
                'last_login'
            ]);
        });
    }
};