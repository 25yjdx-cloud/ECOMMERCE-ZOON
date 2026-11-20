<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cf_return_requests', function (Blueprint $table) {
            $table->id();
            $table->string('store_slug')->index();
            $table->unsignedBigInteger('order_id')->index();
            $table->string('order_number', 32);
            $table->string('phone', 11);
            $table->text('reason');
            $table->string('status', 24)->default('new');
            $table->timestamps();
            $table->index(['store_slug', 'order_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cf_return_requests');
    }
};
