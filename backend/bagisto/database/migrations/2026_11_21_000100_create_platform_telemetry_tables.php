<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cf_active_sessions', function (Blueprint $table) {
            $table->char('session_hash', 64)->primary();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('zone', 32)->index();
            $table->timestamp('last_seen')->index();
        });

        Schema::create('cf_platform_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 48)->index();
            $table->unsignedBigInteger('actor_user_id')->nullable()->index();
            $table->string('store_slug')->nullable()->index();
            $table->string('subject', 180)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        Schema::create('cf_platform_integrations', function (Blueprint $table) {
            $table->string('integration_key', 48)->primary();
            $table->text('encrypted_value')->nullable();
            $table->boolean('enabled')->default(false);
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cf_platform_integrations');
        Schema::dropIfExists('cf_platform_events');
        Schema::dropIfExists('cf_active_sessions');
    }
};
