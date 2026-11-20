<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cf_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('recipient_user_id')->nullable()->index();
            $table->string('recipient_role')->nullable()->index();
            $table->string('store_slug')->nullable()->index();
            $table->string('event_key')->unique();
            $table->string('type', 50);
            $table->string('title_ar');
            $table->string('title_en');
            $table->text('body_ar');
            $table->text('body_en');
            $table->string('whatsapp_status', 20)->default('disabled');
            $table->string('whatsapp_error_code', 50)->nullable();
            $table->timestamp('whatsapp_sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('cf_notification_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_id')->constrained('cf_notifications')->cascadeOnDelete();
            $table->unsignedInteger('user_id');
            $table->timestamp('read_at');
            $table->unique(['notification_id', 'user_id']);
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cf_notification_reads');
        Schema::dropIfExists('cf_notifications');
    }
};
