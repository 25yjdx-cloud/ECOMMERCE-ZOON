<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'two_factor_enabled')) {
            Schema::table('users', fn (Blueprint $table) => $table->boolean('two_factor_enabled')->default(false));
        }

        if (! Schema::hasColumn('users', 'two_factor_secret')) {
            Schema::table('users', fn (Blueprint $table) => $table->text('two_factor_secret')->nullable());
        }

        if (! Schema::hasTable('security_logs')) {
            Schema::create('security_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('user_id')->nullable();
                $table->string('event');
                $table->string('severity', 16)->default('medium');
                $table->char('identifier_hash', 64)->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->string('user_agent', 500)->nullable();
                $table->json('context')->nullable();
                $table->timestamps();
                $table->index(['event', 'created_at']);
            });
        }

        DB::statement('ALTER TABLE security_logs MODIFY user_id INT UNSIGNED NULL');

        $foreignKeyExists = DB::selectOne(
            'SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = ?',
            ['security_logs', 'security_logs_user_id_foreign', 'FOREIGN KEY'],
        );

        if (! $foreignKeyExists) {
            Schema::table('security_logs', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('security_logs');

        if (Schema::hasColumn('users', 'two_factor_enabled')) {
            Schema::table('users', fn (Blueprint $table) => $table->dropColumn('two_factor_enabled'));
        }

        if (Schema::hasColumn('users', 'two_factor_secret')) {
            Schema::table('users', fn (Blueprint $table) => $table->dropColumn('two_factor_secret'));
        }
    }
};
