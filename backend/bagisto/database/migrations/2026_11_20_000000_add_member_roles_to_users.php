<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('member_role')->nullable()->index();
        });

        DB::table('users')
            ->where('role', 'merchant')
            ->whereNotNull('store_slug')
            ->update(['member_role' => 'owner']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['member_role']);
            $table->dropColumn('member_role');
        });
    }
};
