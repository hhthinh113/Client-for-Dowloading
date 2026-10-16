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
        Schema::create('download_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->string('job_id')->unique();
            $table->string('status')->default('pending');
            $table->integer('total_files')->default(0);
            $table->integer('completed_files')->default(0);
            $table->integer('failed_files')->default(0);
            $table->text('destination_path');
            $table->text('naming_pattern');
            $table->string('platform');
            $table->text('search_query');
            $table->float('progress')->default(0);
            $table->text('error_message')->nullable();
            $table->json('files_list')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('download_jobs');
    }
};
