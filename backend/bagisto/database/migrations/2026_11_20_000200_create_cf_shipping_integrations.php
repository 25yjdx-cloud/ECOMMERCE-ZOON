<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cf_store_shipping_integrations', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->string('provider', 20);
            $table->boolean('enabled')->default(false);
            $table->longText('credentials');
            $table->string('webhook_secret_hash', 64);
            $table->timestamps();
            $table->unique(['store_slug', 'provider']);
        });

        Schema::create('cf_shipments', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->unsignedBigInteger('order_id');
            $table->string('provider', 20);
            $table->string('provider_shipment_id')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('status', 30)->default('pending');
            $table->text('label_url')->nullable();
            $table->longText('label_payload')->nullable();
            $table->string('label_mime_type', 100)->nullable();
            $table->string('error_code', 50)->nullable();
            $table->timestamps();
            $table->unique(['store_slug', 'order_id', 'provider']);
        });

        Schema::create('cf_shipping_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 20);
            $table->string('event_key', 64);
            $table->timestamp('processed_at');
            $table->unique(['provider', 'event_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cf_shipping_webhook_events');
        Schema::dropIfExists('cf_shipments');
        Schema::dropIfExists('cf_store_shipping_integrations');
    }
};
