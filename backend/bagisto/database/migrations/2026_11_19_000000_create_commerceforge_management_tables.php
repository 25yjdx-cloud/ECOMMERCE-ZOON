<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cf_templates', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name_ar');
            $table->string('name_en');
            $table->boolean('featured')->default(false);
            $table->string('status')->default('live');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('cf_stores', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('template_slug')->index();
            $table->unsignedInteger('owner_user_id')->nullable()->index();
            $table->json('config');
            $table->timestamps();
        });

        Schema::create('cf_categories', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->string('name_ar');
            $table->string('name_en');
            $table->timestamps();
            $table->unique(['store_slug', 'name_ar']);
        });

        Schema::create('cf_products', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->string('external_id', 64)->nullable();
            $table->foreignId('category_id')->nullable()->constrained('cf_categories')->nullOnDelete();
            $table->string('name_ar');
            $table->string('name_en');
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('old_price', 12, 2)->nullable();
            $table->unsignedInteger('stock_qty')->default(0);
            $table->json('variants')->nullable();
            $table->timestamps();
            $table->unique(['store_slug', 'external_id']);
        });

        Schema::create('cf_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('store_slug')->index();
            $table->string('customer_name');
            $table->string('phone', 11);
            $table->string('governorate');
            $table->text('address');
            $table->json('items');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('shipping_fee', 12, 2);
            $table->decimal('total', 12, 2);
            $table->string('status')->default('new')->index();
            $table->timestamps();
        });

        Schema::create('cf_quote_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 11);
            $table->string('email');
            $table->string('package_id')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('new')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cf_quote_requests');
        Schema::dropIfExists('cf_orders');
        Schema::dropIfExists('cf_products');
        Schema::dropIfExists('cf_categories');
        Schema::dropIfExists('cf_stores');
        Schema::dropIfExists('cf_templates');
    }
};
