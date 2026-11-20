<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('cf_store_shipping_rates')) {
            Schema::create('cf_store_shipping_rates', function (Blueprint $table) {
                $table->id();
                $table->string('store_slug');
                $table->string('governorate');
                $table->decimal('fee', 10, 2);
                $table->boolean('requires_approval')->default(false);
                $table->timestamps();
                $table->unique(['store_slug', 'governorate']);
                $table->index('store_slug');
            });
        }

        if (Schema::hasTable('cf_orders') && ! Schema::hasColumn('cf_orders', 'shipping_requires_approval')) {
            Schema::table('cf_orders', function (Blueprint $table) {
                $table->boolean('shipping_requires_approval')->default(false);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('cf_orders') && Schema::hasColumn('cf_orders', 'shipping_requires_approval')) {
            Schema::table('cf_orders', fn (Blueprint $table) => $table->dropColumn('shipping_requires_approval'));
        }

        Schema::dropIfExists('cf_store_shipping_rates');
    }
};
