<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cf_products', function (Blueprint $table) {
            if (! Schema::hasColumn('cf_products', 'image_url')) {
                $table->text('image_url')->nullable();
            }
            if (! Schema::hasColumn('cf_products', 'sku')) {
                $table->string('sku', 80)->nullable();
            }
        });

        Schema::create('cf_store_files', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->unsignedBigInteger('uploaded_by')->nullable()->index();
            $table->string('disk_path', 512);
            $table->string('public_url', 1024);
            $table->string('original_name', 255);
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size_bytes');
            $table->timestamps();
        });

        Schema::create('cf_coupons', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->string('code', 64);
            $table->string('discount_type', 24);
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->decimal('minimum_order', 12, 2)->default(0);
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['store_slug', 'code']);
        });

        Schema::create('cf_staff_invitations', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->string('email');
            $table->string('member_role', 24)->default('order_manager');
            $table->json('permissions')->nullable();
            $table->char('token_hash', 64)->unique();
            $table->unsignedBigInteger('invited_by');
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
            $table->index(['store_slug', 'email', 'accepted_at']);
        });

        Schema::create('cf_plan_upgrade_requests', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('requested_plan', 32);
            $table->string('status', 24)->default('new');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cf_plan_upgrade_requests');
        Schema::dropIfExists('cf_staff_invitations');
        Schema::dropIfExists('cf_coupons');
        Schema::dropIfExists('cf_store_files');
        Schema::table('cf_products', function (Blueprint $table) {
            if (Schema::hasColumn('cf_products', 'image_url')) $table->dropColumn('image_url');
            if (Schema::hasColumn('cf_products', 'sku')) $table->dropColumn('sku');
        });
    }
};
