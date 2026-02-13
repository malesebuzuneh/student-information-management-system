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
        Schema::table('grades', function (Blueprint $table) {
            // Add grade status workflow
            $table->enum('status', ['draft', 'submitted', 'department_approved', 'finalized'])
                  ->default('draft')
                  ->after('grade');
            
            // Add approval timestamps
            $table->timestamp('submitted_at')->nullable()->after('status');
            $table->timestamp('department_approved_at')->nullable()->after('submitted_at');
            $table->timestamp('finalized_at')->nullable()->after('department_approved_at');
            
            // Add approver tracking
            $table->unsignedBigInteger('department_approved_by')->nullable()->after('finalized_at');
            $table->unsignedBigInteger('finalized_by')->nullable()->after('department_approved_by');
            
            // Foreign keys
            $table->foreign('department_approved_by')->references('id')->on('users');
            $table->foreign('finalized_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropForeign(['department_approved_by']);
            $table->dropForeign(['finalized_by']);
            $table->dropColumn([
                'status',
                'submitted_at',
                'department_approved_at', 
                'finalized_at',
                'department_approved_by',
                'finalized_by'
            ]);
        });
    }
};
